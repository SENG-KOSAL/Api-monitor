import asyncio
import logging
from datetime import datetime, timezone

from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger

from app.database.connection import SessionLocal
from app.model.monitor import Monitor
from app.model.check_result import CheckResult
from app.services.health_checker_async import check_health_async

logger = logging.getLogger(__name__)


def _check_monitor_job(monitor_id: int) -> None:
    """
    Scheduled job: perform a health check for a single monitor.
    Runs in a thread via APScheduler, uses asyncio.run() for async httpx.
    """
    db = SessionLocal()
    try:
        monitor = db.query(Monitor).filter(Monitor.id == monitor_id).first()
        if monitor is None:
            logger.warning("Monitor %s no longer exists, removing job", monitor_id)
            return

        if not monitor.is_active:
            logger.info("Monitor %s is inactive, skipping check", monitor_id)
            return

        result = asyncio.run(check_health_async(monitor.url))

        check_result = CheckResult(
            monitor_id=monitor.id,
            status_code=result["status_code"],
            reason_phrase=result.get("reason_phrase"),
            response_time=result["response_time"],
            error=result["error"],
            headers=result.get("headers"),
            body=result.get("body"),
            checked_at=datetime.now(timezone.utc),
        )
        db.add(check_result)
        db.commit()

        status = "OK" if result["status_code"] and result["status_code"] < 400 else "FAIL"
        logger.info(
            "[%s] %s %s -> %s (%.3fs)",
            monitor.name,
            status,
            monitor.url,
            result["status_code"] or result["error"],
            result["response_time"],
        )
    except Exception as e:
        logger.error("Error checking monitor %s: %s", monitor_id, e)
    finally:
        db.close()


class HealthScheduler:
    """Manages scheduled health check jobs for all active monitors."""

    def __init__(self):
        self.scheduler = BackgroundScheduler(
            job_defaults={
                "coalesce": True,
                "max_instances": 1,
                "misfire_grace_time": 60,
            }
        )

    def start(self) -> None:
        """Start the scheduler and register all active monitors."""
        self.scheduler.start()
        self._load_active_monitors()
        logger.info("Health scheduler started")

    def stop(self) -> None:
        """Shutdown the scheduler gracefully."""
        self.scheduler.shutdown(wait=False)
        logger.info("Health scheduler stopped")

    def _load_active_monitors(self) -> None:
        """Query all active monitors and register them as scheduled jobs."""
        db = SessionLocal()
        try:
            monitors = db.query(Monitor).filter(Monitor.is_active.is_(True)).all()
            for monitor in monitors:
                self._add_job(monitor)
            logger.info("Loaded %d active monitors into scheduler", len(monitors))
        finally:
            db.close()

    def _add_job(self, monitor: Monitor) -> None:
        """Add a scheduled job for a single monitor."""
        job_id = f"monitor_{monitor.id}"

        if self.scheduler.get_job(job_id):
            self.scheduler.remove_job(job_id)

        self.scheduler.add_job(
            func=_check_monitor_job,
            trigger=IntervalTrigger(seconds=monitor.interval_seconds),
            args=[monitor.id],
            id=job_id,
            name=f"Health check: {monitor.name}",
            replace_existing=True,
        )
        logger.info(
            "Scheduled monitor '%s' (id=%s) every %ds",
            monitor.name,
            monitor.id,
            monitor.interval_seconds,
        )

    def add_monitor(self, monitor: Monitor) -> None:
        """Register a newly created monitor with the scheduler."""
        if monitor.is_active:
            self._add_job(monitor)

    def remove_monitor(self, monitor_id: int) -> None:
        """Remove a monitor's scheduled job."""
        job_id = f"monitor_{monitor_id}"
        if self.scheduler.get_job(job_id):
            self.scheduler.remove_job(job_id)
            logger.info("Removed scheduler job for monitor %s", monitor_id)

    def update_monitor(self, monitor: Monitor) -> None:
        """Re-register a monitor (e.g. after interval or active status changes)."""
        self.remove_monitor(monitor.id)
        if monitor.is_active:
            self._add_job(monitor)


scheduler = HealthScheduler()

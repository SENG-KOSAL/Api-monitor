import logging
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.model.check_result import CheckResult
from app.model.incident import Incident
from app.model.monitor import Monitor
from app.services.uptime import _is_up

logger = logging.getLogger(__name__)


def _derive_reason(result: CheckResult) -> str:
    """Derive a human-readable reason from a failing CheckResult."""
    if result.error:
        return result.error
    if result.status_code is not None:
        return f"HTTP {result.status_code}"
    return "Unknown failure"


def detect_incident(db: Session, monitor: Monitor, result: CheckResult) -> None:
    """
    Run incident detection after a CheckResult is saved.

    Logic:
      - If check is healthy: reset consecutive_failures, close any open incident.
      - If check is failing: increment consecutive_failures, open an incident
        once the failure_threshold is reached (using the first fail's timestamp).
    """
    is_up = _is_up(result)
    open_incident = (
        db.query(Incident)
        .filter(Incident.monitor_id == monitor.id, Incident.status == "open")
        .first()
    )

    if is_up:
        # Healthy check
        monitor.consecutive_failures = 0
        monitor.failure_streak_started_at = None

        if open_incident is not None:
            # Auto-resolve the incident
            open_incident.resolved_at = result.checked_at
            open_incident.status = "resolved"
            open_incident.last_check_result_id = result.id
            delta = open_incident.resolved_at - open_incident.started_at
            open_incident.duration_seconds = int(delta.total_seconds())
            logger.info(
                "Incident %s resolved for monitor %s after %.0fs",
                open_incident.id,
                monitor.name,
                open_incident.duration_seconds,
            )
    else:
        # Failing check
        monitor.consecutive_failures += 1

        if monitor.failure_streak_started_at is None:
            monitor.failure_streak_started_at = result.checked_at

        if open_incident is None and monitor.consecutive_failures >= monitor.failure_threshold:
            # Threshold reached — open a new incident
            incident = Incident(
                monitor_id=monitor.id,
                status="open",
                started_at=monitor.failure_streak_started_at,
                reason=_derive_reason(result),
                first_check_result_id=monitor.check_results[-1].id if monitor.check_results else None,
                last_check_result_id=result.id,
            )
            db.add(incident)
            logger.warning(
                "Incident opened for monitor %s: %s (streak started at %s)",
                monitor.name,
                incident.reason,
                monitor.failure_streak_started_at,
            )

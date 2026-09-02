from datetime import datetime, timedelta, timezone
from typing import List

from sqlalchemy.orm import Session

from app.model.check_result import CheckResult
from app.schemas.uptime import MonitorUptime, UptimeStats


def _is_up(result: CheckResult) -> bool:
    """
    Strict definition: a check counts as "up" only if there was no error
    AND the status code falls in the 2xx or 3xx range.
    """
    if result.error:
        return False
    return result.status_code is not None and 200 <= result.status_code < 400


def _stats_for_window(
    results: List[CheckResult],
    window_start: datetime,
    period_label: str,
) -> UptimeStats:
    windowed = [r for r in results if r.checked_at >= window_start]
    total = len(windowed)

    if total == 0:
        return UptimeStats(
            period=period_label,
            uptime_percentage=None,
            total_checks=0,
            successful_checks=0,
            failed_checks=0,
        )

    successful = sum(1 for r in windowed if _is_up(r))
    failed = total - successful

    return UptimeStats(
        period=period_label,
        uptime_percentage=round((successful / total) * 100, 2),
        total_checks=total,
        successful_checks=successful,
        failed_checks=failed,
    )


def calculate_uptime(db: Session, monitor_id: int) -> MonitorUptime:
    """
    Calculate 24h / 7d / 30d uptime stats for a monitor in a single query,
    bucketing the results in Python to avoid three separate DB round trips.
    """
    now = datetime.now(timezone.utc)
    month_start = now - timedelta(days=30)

    # Fetch once, using the widest window (30 days); narrower windows are
    # derived by filtering this same list in memory.
    results = (
        db.query(CheckResult)
        .filter(CheckResult.monitor_id == monitor_id)
        .filter(CheckResult.checked_at >= month_start)
        .all()
    )

    day_start = now - timedelta(hours=24)
    week_start = now - timedelta(days=7)

    return MonitorUptime(
        day=_stats_for_window(results, day_start, "24h"),
        week=_stats_for_window(results, week_start, "7d"),
        month=_stats_for_window(results, month_start, "30d"),
    )

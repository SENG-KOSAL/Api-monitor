from typing import Optional

from pydantic import BaseModel


class UptimeStats(BaseModel):
    period: str  # "24h" | "7d" | "30d"
    uptime_percentage: Optional[float] = None
    total_checks: int
    successful_checks: int
    failed_checks: int


class MonitorUptime(BaseModel):
    day: UptimeStats
    week: UptimeStats
    month: UptimeStats

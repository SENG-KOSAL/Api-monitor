from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class IncidentResponse(BaseModel):
    id: int
    monitor_id: int
    status: str
    started_at: datetime
    resolved_at: Optional[datetime] = None
    reason: str
    duration_seconds: Optional[int] = None
    first_check_result_id: Optional[int] = None
    last_check_result_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True

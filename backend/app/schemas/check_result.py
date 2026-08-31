from datetime import datetime
from typing import Optional

from pydantic import BaseModel


class CheckResultResponse(BaseModel):
    id: int
    monitor_id: int
    status_code: Optional[int] = None
    response_time: float
    error: Optional[str] = None
    checked_at: datetime

    class Config:
        from_attributes = True

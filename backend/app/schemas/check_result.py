from datetime import datetime
from typing import Any, Dict, Optional

from pydantic import BaseModel


class CheckResultResponse(BaseModel):
    id: int
    monitor_id: int
    status_code: Optional[int] = None
    reason_phrase: Optional[str] = None
    response_time: float
    error: Optional[str] = None
    headers: Optional[Dict[str, Any]] = None
    body: Optional[str] = None
    checked_at: datetime

    class Config:
        from_attributes = True

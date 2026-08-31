from pydantic import BaseModel, Field, HttpUrl, validator
from typing import Optional
from datetime import datetime


class MonitorBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Name of the monitor")
    url: HttpUrl = Field(..., description="URL to monitor")
    interval_seconds: int = Field(300, ge=10, le=86400, description="Interval in seconds between health checks")
    is_active: bool = Field(True, description="Whether the monitor is active")


class MonitorCreate(MonitorBase):
    pass


class MonitorUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    url: Optional[HttpUrl] = None
    interval_seconds: Optional[int] = Field(None, ge=10, le=86400)
    is_active: Optional[bool] = None


class MonitorResponse(MonitorBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
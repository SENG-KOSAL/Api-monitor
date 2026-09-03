from pydantic import BaseModel, Field, HttpUrl, model_validator
from typing import Optional, Literal
from datetime import datetime


class MonitorBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Name of the monitor")
    url: HttpUrl = Field(..., description="URL to monitor")
    interval_seconds: int = Field(300, ge=10, le=86400, description="Interval in seconds between health checks")
    is_active: bool = Field(True, description="Whether the monitor is active")
    auth_type: Literal["none", "bearer"] = Field("none", description="Authentication type: 'none' or 'bearer'")
    auth_token: Optional[str] = Field(None, description="Bearer token value if auth_type is 'bearer'")

    @model_validator(mode="after")
    def validate_auth(self):
        if self.auth_type == "none":
            self.auth_token = None
        elif self.auth_type == "bearer":
            if not self.auth_token or not self.auth_token.strip():
                raise ValueError("Bearer token is required when authentication type is 'bearer'")
            self.auth_token = self.auth_token.strip()
        return self


class MonitorCreate(MonitorBase):
    pass


class MonitorUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    url: Optional[HttpUrl] = None
    interval_seconds: Optional[int] = Field(None, ge=10, le=86400)
    is_active: Optional[bool] = None
    auth_type: Optional[Literal["none", "bearer"]] = None
    auth_token: Optional[str] = None

    @model_validator(mode="after")
    def validate_auth(self):
        if self.auth_type == "none":
            self.auth_token = None
        elif self.auth_type == "bearer" and self.auth_token is not None:
            if not self.auth_token.strip():
                raise ValueError("Bearer token cannot be empty when authentication type is 'bearer'")
            self.auth_token = self.auth_token.strip()
        return self


class MonitorResponse(MonitorBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
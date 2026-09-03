from pydantic import BaseModel, Field, HttpUrl, model_validator
from typing import Optional, Literal
from datetime import datetime


class MonitorBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255, description="Name of the monitor")
    url: HttpUrl = Field(..., description="URL to monitor")
    interval_seconds: int = Field(300, ge=10, le=86400, description="Interval in seconds between health checks")
    is_active: bool = Field(True, description="Whether the monitor is active")
    auth_type: Literal["none", "bearer", "basic"] = Field("none", description="Authentication type: 'none', 'bearer', or 'basic'")
    auth_token: Optional[str] = Field(None, description="Bearer token value if auth_type is 'bearer'")
    auth_username: Optional[str] = Field(None, description="Username if auth_type is 'basic'")
    auth_password: Optional[str] = Field(None, description="Password if auth_type is 'basic'")

    @model_validator(mode="after")
    def validate_auth(self):
        if self.auth_type == "none":
            self.auth_token = None
            self.auth_username = None
            self.auth_password = None
        elif self.auth_type == "bearer":
            if not self.auth_token or not self.auth_token.strip():
                raise ValueError("Bearer token is required when authentication type is 'bearer'")
            self.auth_token = self.auth_token.strip()
            self.auth_username = None
            self.auth_password = None
        elif self.auth_type == "basic":
            if not self.auth_username or not self.auth_username.strip():
                raise ValueError("Username is required when authentication type is 'basic'")
            if not self.auth_password or not self.auth_password.strip():
                raise ValueError("Password is required when authentication type is 'basic'")
            self.auth_username = self.auth_username.strip()
            self.auth_password = self.auth_password.strip()
            self.auth_token = None
        return self


class MonitorCreate(MonitorBase):
    pass


class MonitorUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    url: Optional[HttpUrl] = None
    interval_seconds: Optional[int] = Field(None, ge=10, le=86400)
    is_active: Optional[bool] = None
    auth_type: Optional[Literal["none", "bearer", "basic"]] = None
    auth_token: Optional[str] = None
    auth_username: Optional[str] = None
    auth_password: Optional[str] = None

    @model_validator(mode="after")
    def validate_auth(self):
        if self.auth_type == "none":
            self.auth_token = None
            self.auth_username = None
            self.auth_password = None
        elif self.auth_type == "bearer":
            self.auth_username = None
            self.auth_password = None
            if self.auth_token is not None:
                if not self.auth_token.strip():
                    raise ValueError("Bearer token cannot be empty when authentication type is 'bearer'")
                self.auth_token = self.auth_token.strip()
        elif self.auth_type == "basic":
            self.auth_token = None
            if self.auth_username is not None:
                if not self.auth_username.strip():
                    raise ValueError("Username cannot be empty when authentication type is 'basic'")
                self.auth_username = self.auth_username.strip()
            if self.auth_password is not None:
                if not self.auth_password.strip():
                    raise ValueError("Password cannot be empty when authentication type is 'basic'")
                self.auth_password = self.auth_password.strip()
        return self


class MonitorResponse(MonitorBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
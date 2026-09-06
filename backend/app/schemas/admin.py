from typing import Literal

from pydantic import BaseModel


class UserStatusUpdate(BaseModel):
    """Body for PATCH /api/admin/users/{id}/status."""

    is_active: bool


class UserRoleUpdate(BaseModel):
    """Body for PATCH /api/admin/users/{id}/role."""

    role: Literal["admin", "developer"]


class PlatformOverview(BaseModel):
    """Response for GET /api/admin/overview."""

    total_users: int
    active_users: int
    disabled_users: int
    admin_count: int
    developer_count: int
    total_monitors: int
    active_monitors: int

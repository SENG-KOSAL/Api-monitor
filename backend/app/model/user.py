from datetime import datetime, timezone
from typing import List

from sqlalchemy import Boolean, DateTime, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.connection import Base


class UserRole:
    """
    Plain string role constants (not a native DB enum, to match the rest of
    the codebase — see Monitor.auth_type) so adding a new role later is just
    a migration + a new constant, never a destructive type change.
    """

    ADMIN = "admin"
    DEVELOPER = "developer"

    ALL = {ADMIN, DEVELOPER}


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
    )

    full_name: Mapped[str] = mapped_column(
        String(255),
        nullable=True,
    )

    # Never store or return the raw password — only its bcrypt hash.
    hashed_password: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    # DEVELOPER: manages only their own monitors/results.
    # ADMIN: can view/enable/disable users and change roles (see
    # app/dependencies.py::require_admin and app/routers/admin.py).
    role: Mapped[str] = mapped_column(
        String(20),
        default=UserRole.DEVELOPER,
        server_default=UserRole.DEVELOPER,
        nullable=False,
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    monitors: Mapped[List["Monitor"]] = relationship(
        "Monitor",
        back_populates="owner",
        cascade="all, delete-orphan",
    )

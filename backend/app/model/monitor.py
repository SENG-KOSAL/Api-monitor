from datetime import datetime, timezone
from typing import List, Optional

from sqlalchemy import Boolean, DateTime, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.connection import Base


class Monitor(Base):
    __tablename__ = "monitors"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    url: Mapped[str] = mapped_column(
        String(2048),
        nullable=False,
    )

    interval_seconds: Mapped[int] = mapped_column(
        Integer,
        default=300,
        nullable=False,
    )

    auth_type: Mapped[str] = mapped_column(
        String(50),
        default="none",
        nullable=False,
    )

    auth_token: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )

    auth_username: Mapped[Optional[str]] = mapped_column(
        String(255),
        nullable=True,
    )

    auth_password: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    failure_threshold: Mapped[int] = mapped_column(
        Integer,
        default=1,
        nullable=False,
    )

    consecutive_failures: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    failure_streak_started_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
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

    check_results: Mapped[List["CheckResult"]] = relationship(
        "CheckResult",
        cascade="all, delete-orphan",
        back_populates="monitor",
    )

    incidents: Mapped[List["Incident"]] = relationship(
        "Incident",
        cascade="all, delete-orphan",
        back_populates="monitor",
    )
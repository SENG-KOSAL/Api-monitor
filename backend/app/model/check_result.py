from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.connection import Base


class CheckResult(Base):
    __tablename__ = "check_results"

    id: Mapped[int] = mapped_column(
        Integer,
        primary_key=True,
        index=True,
    )

    monitor_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("monitors.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    status_code: Mapped[int] = mapped_column(
        Integer,
        nullable=True,
    )

    response_time: Mapped[float] = mapped_column(
        Float,
        nullable=False,
    )

    error: Mapped[str] = mapped_column(
        Text,
        nullable=True,
    )

    checked_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
        index=True,
    )

    monitor: Mapped["Monitor"] = relationship(
        "Monitor",
        back_populates="check_results",
    )

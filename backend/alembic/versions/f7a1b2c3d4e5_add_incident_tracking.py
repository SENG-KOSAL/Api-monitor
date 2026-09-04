"""Add incident tracking: new columns on monitors, incidents table

Revision ID: f7a1b2c3d4e5
Revises: 3fe9dcf88c72
Create Date: 2026-09-04
"""

from alembic import op
import sqlalchemy as sa


# revision identifiers
revision = "f7a1b2c3d4e5"
down_revision = "3fe9dcf88c72"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add new columns to monitors table
    op.add_column(
        "monitors",
        sa.Column("failure_threshold", sa.Integer(), nullable=False, server_default="1"),
    )
    op.add_column(
        "monitors",
        sa.Column("consecutive_failures", sa.Integer(), nullable=False, server_default="0"),
    )
    op.add_column(
        "monitors",
        sa.Column("failure_streak_started_at", sa.DateTime(timezone=True), nullable=True),
    )

    # Create incidents table
    op.create_table(
        "incidents",
        sa.Column("id", sa.Integer(), primary_key=True, index=True),
        sa.Column(
            "monitor_id",
            sa.Integer(),
            sa.ForeignKey("monitors.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        ),
        sa.Column("status", sa.String(20), nullable=False, server_default="open"),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("resolved_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("reason", sa.Text(), nullable=False),
        sa.Column("duration_seconds", sa.Integer(), nullable=True),
        sa.Column(
            "first_check_result_id",
            sa.Integer(),
            sa.ForeignKey("check_results.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column(
            "last_check_result_id",
            sa.Integer(),
            sa.ForeignKey("check_results.id", ondelete="SET NULL"),
            nullable=True,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )


def downgrade() -> None:
    op.drop_table("incidents")
    op.drop_column("monitors", "failure_streak_started_at")
    op.drop_column("monitors", "consecutive_failures")
    op.drop_column("monitors", "failure_threshold")

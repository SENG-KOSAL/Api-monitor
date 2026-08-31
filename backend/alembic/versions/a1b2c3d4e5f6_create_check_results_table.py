"""create check_results table

Revision ID: a1b2c3d4e5f6
Revises: 16fcf1fdcb2f
Create Date: 2026-08-31 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = '16fcf1fdcb2f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'check_results',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('monitor_id', sa.Integer(), nullable=False),
        sa.Column('status_code', sa.Integer(), nullable=True),
        sa.Column('response_time', sa.Float(), nullable=False),
        sa.Column('error', sa.Text(), nullable=True),
        sa.Column('checked_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['monitor_id'], ['monitors.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_check_results_id'), 'check_results', ['id'], unique=False)
    op.create_index(op.f('ix_check_results_monitor_id'), 'check_results', ['monitor_id'], unique=False)
    op.create_index(op.f('ix_check_results_checked_at'), 'check_results', ['checked_at'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_check_results_checked_at'), table_name='check_results')
    op.drop_index(op.f('ix_check_results_monitor_id'), table_name='check_results')
    op.drop_index(op.f('ix_check_results_id'), table_name='check_results')
    op.drop_table('check_results')

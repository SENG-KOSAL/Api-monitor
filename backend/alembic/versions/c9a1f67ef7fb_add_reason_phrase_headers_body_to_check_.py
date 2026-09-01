"""add reason_phrase headers body to check_results

Revision ID: c9a1f67ef7fb
Revises: a1b2c3d4e5f6
Create Date: 2026-08-31 22:54:19.679335

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c9a1f67ef7fb'
down_revision: Union[str, Sequence[str], None] = 'a1b2c3d4e5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('check_results', sa.Column('reason_phrase', sa.String(length=255), nullable=True))
    op.add_column('check_results', sa.Column('headers', sa.JSON(), nullable=True))
    op.add_column('check_results', sa.Column('body', sa.Text(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('check_results', 'body')
    op.drop_column('check_results', 'headers')
    op.drop_column('check_results', 'reason_phrase')

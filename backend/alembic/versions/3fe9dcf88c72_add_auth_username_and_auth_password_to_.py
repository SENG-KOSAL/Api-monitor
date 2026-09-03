"""add auth_username and auth_password to monitors

Revision ID: 3fe9dcf88c72
Revises: 99a3faa533f4
Create Date: 2026-09-03 22:23:26.333258

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '3fe9dcf88c72'
down_revision: Union[str, Sequence[str], None] = '99a3faa533f4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('monitors', sa.Column('auth_username', sa.String(length=255), nullable=True))
    op.add_column('monitors', sa.Column('auth_password', sa.Text(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('monitors', 'auth_password')
    op.drop_column('monitors', 'auth_username')

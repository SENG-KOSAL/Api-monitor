"""add role to users

Revision ID: d4e5f6a7b8c9
Revises: a3d8e21c9b4f
Create Date: 2026-09-06

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd4e5f6a7b8c9'
down_revision: Union[str, Sequence[str], None] = 'a3d8e21c9b4f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Plain VARCHAR (not a native DB enum) so adding a role later is just a
    # new constant in app/model/user.py::UserRole, never a migration that
    # touches a Postgres enum type. Every existing row becomes 'developer'.
    op.add_column(
        'users',
        sa.Column('role', sa.String(length=20), nullable=False, server_default='developer'),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('users', 'role')

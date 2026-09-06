"""add users table and monitors.user_id

Revision ID: a3d8e21c9b4f
Revises: f7a1b2c3d4e5
Create Date: 2026-09-06

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a3d8e21c9b4f'
down_revision: Union[str, Sequence[str], None] = 'f7a1b2c3d4e5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('full_name', sa.String(length=255), nullable=True),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)

    # Nullable so existing monitor rows (created before accounts existed)
    # don't break the migration. New monitors always set this at the
    # application layer.
    op.add_column('monitors', sa.Column('user_id', sa.Integer(), nullable=True))
    op.create_index(op.f('ix_monitors_user_id'), 'monitors', ['user_id'], unique=False)
    op.create_foreign_key(
        'fk_monitors_user_id_users',
        'monitors', 'users',
        ['user_id'], ['id'],
        ondelete='CASCADE',
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_constraint('fk_monitors_user_id_users', 'monitors', type_='foreignkey')
    op.drop_index(op.f('ix_monitors_user_id'), table_name='monitors')
    op.drop_column('monitors', 'user_id')

    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_table('users')

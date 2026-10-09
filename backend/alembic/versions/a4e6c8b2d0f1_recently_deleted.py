"""recently deleted: DeletedItem table

Revision ID: a4e6c8b2d0f1
Revises: f1c7d9e3a5b8
Create Date: 2026-10-09 10:00:00.000000

Deleted admin records are kept here for 7 days so they can be restored.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a4e6c8b2d0f1'
down_revision: Union[str, Sequence[str], None] = 'f1c7d9e3a5b8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    inspector = sa.inspect(op.get_bind())
    if 'DeletedItem' in inspector.get_table_names():
        return  # already created by create_all at startup
    op.create_table(
        'DeletedItem',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('resource', sa.String(length=30), nullable=False),
        sa.Column('record_id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False, server_default=''),
        sa.Column('data', sa.JSON(), nullable=False),
        sa.Column('files', sa.JSON(), nullable=False),
        sa.Column('deleted_by', sa.String(length=100), nullable=True),
        sa.Column('deleted_at', sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index('ix_DeletedItem_id', 'DeletedItem', ['id'])
    op.create_index('ix_DeletedItem_resource', 'DeletedItem', ['resource'])
    op.create_index('ix_DeletedItem_deleted_at', 'DeletedItem', ['deleted_at'])


def downgrade() -> None:
    """Downgrade schema."""
    if 'DeletedItem' in sa.inspect(op.get_bind()).get_table_names():
        op.drop_table('DeletedItem')

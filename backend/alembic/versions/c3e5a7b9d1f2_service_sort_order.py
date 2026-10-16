"""service sort order

Revision ID: c3e5a7b9d1f2
Revises: b9e1a3c5d7f9
Create Date: 2026-10-17 12:00:00.000000

Services get a display order (Dashboard → Manage Services, ↑ ↓). Existing
services keep today's order (by id).
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c3e5a7b9d1f2'
down_revision: Union[str, Sequence[str], None] = 'b9e1a3c5d7f9'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _columns(bind) -> set[str]:
    return {c["name"] for c in sa.inspect(bind).get_columns('Service')}


def upgrade() -> None:
    """Upgrade schema."""
    bind = op.get_bind()
    if 'Service' not in sa.inspect(bind).get_table_names() or 'sort_order' in _columns(bind):
        return
    op.add_column('Service', sa.Column('sort_order', sa.Integer(), nullable=False, server_default='0'))
    op.execute('UPDATE "Service" SET sort_order = id')


def downgrade() -> None:
    """Downgrade schema."""
    bind = op.get_bind()
    if 'Service' in sa.inspect(bind).get_table_names() and 'sort_order' in _columns(bind):
        with op.batch_alter_table('Service') as batch:
            batch.drop_column('sort_order')

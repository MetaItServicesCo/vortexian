"""portfolio title design

Revision ID: f6b8d0e2a4c5
Revises: e5a7c9d1f3b4
Create Date: 2026-10-21 14:00:00.000000

Per-project style of the big title on a portfolio page (size, weight, case, colour,
highlighted words, line breaks), as JSON. NULL keeps today's look.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f6b8d0e2a4c5'
down_revision: Union[str, Sequence[str], None] = 'e5a7c9d1f3b4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _has(bind) -> bool:
    return 'title_design' in {c["name"] for c in sa.inspect(bind).get_columns('Portfolio')}


def upgrade() -> None:
    """Upgrade schema."""
    bind = op.get_bind()
    if 'Portfolio' in sa.inspect(bind).get_table_names() and not _has(bind):
        op.add_column('Portfolio', sa.Column('title_design', sa.Text(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    bind = op.get_bind()
    if 'Portfolio' in sa.inspect(bind).get_table_names() and _has(bind):
        with op.batch_alter_table('Portfolio') as batch:
            batch.drop_column('title_design')

"""service url slug optional ("Others" services have none)

Revision ID: d4f6b8c0e2a3
Revises: c3e5a7b9d1f2
Create Date: 2026-10-20 12:00:00.000000

Services in the "Others" category are cards on the Other Services page only:
no page of their own, so no address. url_slug becomes nullable (still unique
when set) and is cleared for services already in Others.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd4f6b8c0e2a3'
down_revision: Union[str, Sequence[str], None] = 'c3e5a7b9d1f2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _slug_nullable(bind) -> bool:
    for c in sa.inspect(bind).get_columns('Service'):
        if c["name"] == 'url_slug':
            return bool(c["nullable"])
    return True


def upgrade() -> None:
    """Upgrade schema."""
    bind = op.get_bind()
    if 'Service' not in sa.inspect(bind).get_table_names():
        return
    if not _slug_nullable(bind):
        with op.batch_alter_table('Service') as batch:
            batch.alter_column('url_slug', existing_type=sa.String(length=150), nullable=True)
    if 'Category' in sa.inspect(bind).get_table_names():
        op.execute(
            'UPDATE "Service" SET url_slug = NULL WHERE category_id IN '
            '(SELECT id FROM "Category" WHERE kind = \'service\' AND is_system = true)'
        )


def downgrade() -> None:
    """Downgrade schema: give address-less services an address again, then require it."""
    bind = op.get_bind()
    if 'Service' not in sa.inspect(bind).get_table_names():
        return
    op.execute("UPDATE \"Service\" SET url_slug = 'service-' || id WHERE url_slug IS NULL")
    if _slug_nullable(bind):
        with op.batch_alter_table('Service') as batch:
            batch.alter_column('url_slug', existing_type=sa.String(length=150), nullable=False)

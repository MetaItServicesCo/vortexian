"""newsletter: cover image and subject headline

Revision ID: f3b5d7e9a1c4
Revises: e1a3c5d7f9b2
Create Date: 2026-10-11 10:00:00.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f3b5d7e9a1c4'
down_revision: Union[str, Sequence[str], None] = 'e1a3c5d7f9b2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

COLUMNS = (
    ('cover_image', lambda: sa.Column('cover_image', sa.Text(), nullable=True)),
    ('cover_image_alt', lambda: sa.Column('cover_image_alt', sa.String(length=255), nullable=True)),
    ('show_headline', lambda: sa.Column('show_headline', sa.Boolean(), nullable=False, server_default=sa.true())),
)


def upgrade() -> None:
    """Upgrade schema."""
    inspector = sa.inspect(op.get_bind())
    if 'NewsletterIssue' not in inspector.get_table_names():
        return
    existing = {c["name"] for c in inspector.get_columns('NewsletterIssue')}
    for name, column in COLUMNS:
        if name not in existing:
            op.add_column('NewsletterIssue', column())


def downgrade() -> None:
    """Downgrade schema."""
    inspector = sa.inspect(op.get_bind())
    if 'NewsletterIssue' not in inspector.get_table_names():
        return
    existing = {c["name"] for c in inspector.get_columns('NewsletterIssue')}
    for name, _ in reversed(COLUMNS):
        if name in existing:
            op.drop_column('NewsletterIssue', name)

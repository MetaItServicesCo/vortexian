"""add alt text for uploaded images

Revision ID: d3a9c5e7f1b2
Revises: b7d2e4f6a8c1
Create Date: 2026-10-08 10:00:00.000000

Guarded per table/column: tables that do not exist yet are created complete
by Base.metadata.create_all at startup.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd3a9c5e7f1b2'
down_revision: Union[str, Sequence[str], None] = 'b7d2e4f6a8c1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

ALT_COLUMNS = [
    ('Blog', 'featured_image_alt'),
    ('Portfolio', 'primary_image_alt'),
    ('Service', 'image_alt'),
    ('Team', 'profile_image_alt'),
    ('Testimonial', 'profile_image_alt'),
    ('NewsFeed', 'media_alt'),
]


def _columns(table: str) -> set[str] | None:
    inspector = sa.inspect(op.get_bind())
    if table not in inspector.get_table_names():
        return None
    return {c["name"] for c in inspector.get_columns(table)}


def upgrade() -> None:
    """Upgrade schema."""
    for table, column in ALT_COLUMNS:
        columns = _columns(table)
        if columns is not None and column not in columns:
            op.add_column(table, sa.Column(column, sa.String(length=255), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    for table, column in ALT_COLUMNS:
        columns = _columns(table)
        if columns is not None and column in columns:
            op.drop_column(table, column)

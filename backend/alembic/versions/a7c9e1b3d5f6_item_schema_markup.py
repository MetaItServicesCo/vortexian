"""schema markup per blog post, service, page and portfolio project

Revision ID: a7c9e1b3d5f6
Revises: f3b5d7e9a1c4
Create Date: 2026-10-11 14:00:00.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a7c9e1b3d5f6'
down_revision: Union[str, Sequence[str], None] = 'f3b5d7e9a1c4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

TABLES = ("Blog", "Service", "Page", "Portfolio")


def upgrade() -> None:
    """Upgrade schema."""
    inspector = sa.inspect(op.get_bind())
    for table in TABLES:
        if table in inspector.get_table_names() and 'schema_json' not in {c["name"] for c in inspector.get_columns(table)}:
            op.add_column(table, sa.Column('schema_json', sa.Text(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    inspector = sa.inspect(op.get_bind())
    for table in TABLES:
        if table in inspector.get_table_names() and 'schema_json' in {c["name"] for c in inspector.get_columns(table)}:
            op.drop_column(table, 'schema_json')

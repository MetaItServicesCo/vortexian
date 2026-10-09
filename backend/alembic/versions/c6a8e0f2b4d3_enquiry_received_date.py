"""enquiries: received date

Revision ID: c6a8e0f2b4d3
Revises: b5f7d9e1c3a2
Create Date: 2026-10-10 12:00:00.000000

Home page enquiries (ContactUs) and quote requests (Contact) record when they
arrive. Existing rows stay NULL ("unknown") rather than getting today's date;
new rows are stamped by the application.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c6a8e0f2b4d3'
down_revision: Union[str, Sequence[str], None] = 'b5f7d9e1c3a2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

TABLES = ("ContactUs", "Contact")


def upgrade() -> None:
    """Upgrade schema."""
    inspector = sa.inspect(op.get_bind())
    for table in TABLES:
        if table in inspector.get_table_names() and 'created_at' not in {c["name"] for c in inspector.get_columns(table)}:
            op.add_column(table, sa.Column('created_at', sa.DateTime(timezone=True), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    inspector = sa.inspect(op.get_bind())
    for table in TABLES:
        if table in inspector.get_table_names() and 'created_at' in {c["name"] for c in inspector.get_columns(table)}:
            op.drop_column(table, 'created_at')

"""service pricing section

Revision ID: f7c9e1a3b5d6
Revises: e6b8d0f2a4c5
Create Date: 2026-10-16 12:00:00.000000

Each service can have its own pricing section (JSON, see app/pricing.py),
edited in the service editor and shown on the service page.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f7c9e1a3b5d6'
down_revision: Union[str, Sequence[str], None] = 'e6b8d0f2a4c5'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    inspector = sa.inspect(op.get_bind())
    if 'Service' in inspector.get_table_names() and 'pricing' not in {c["name"] for c in inspector.get_columns('Service')}:
        op.add_column('Service', sa.Column('pricing', sa.Text(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    inspector = sa.inspect(op.get_bind())
    if 'Service' in inspector.get_table_names() and 'pricing' in {c["name"] for c in inspector.get_columns('Service')}:
        op.drop_column('Service', 'pricing')

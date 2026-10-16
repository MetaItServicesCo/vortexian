"""service page layout (page sections)

Revision ID: a8d0f2b4c6e8
Revises: f7c9e1a3b5d6
Create Date: 2026-10-16 16:00:00.000000

Ordered, movable blocks of a service page (JSON, see app/service_layout.py).
Services without a layout use the default: intro, why choose, overview, pricing.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a8d0f2b4c6e8'
down_revision: Union[str, Sequence[str], None] = 'f7c9e1a3b5d6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    inspector = sa.inspect(op.get_bind())
    if 'Service' in inspector.get_table_names() and 'layout' not in {c["name"] for c in inspector.get_columns('Service')}:
        op.add_column('Service', sa.Column('layout', sa.Text(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    inspector = sa.inspect(op.get_bind())
    if 'Service' in inspector.get_table_names() and 'layout' in {c["name"] for c in inspector.get_columns('Service')}:
        op.drop_column('Service', 'layout')

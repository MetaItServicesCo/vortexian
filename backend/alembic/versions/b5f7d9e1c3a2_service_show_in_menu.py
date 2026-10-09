"""services: show in Services menu

Revision ID: b5f7d9e1c3a2
Revises: a4e6c8b2d0f1
Create Date: 2026-10-10 09:00:00.000000

Existing services keep appearing (default true).
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b5f7d9e1c3a2'
down_revision: Union[str, Sequence[str], None] = 'a4e6c8b2d0f1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    inspector = sa.inspect(op.get_bind())
    if 'Service' not in inspector.get_table_names():
        return  # created complete by create_all at startup
    if 'show_in_menu' not in {c["name"] for c in inspector.get_columns('Service')}:
        op.add_column('Service', sa.Column('show_in_menu', sa.Boolean(), nullable=False, server_default=sa.true()))


def downgrade() -> None:
    """Downgrade schema."""
    inspector = sa.inspect(op.get_bind())
    if 'Service' in inspector.get_table_names() and 'show_in_menu' in {c["name"] for c in inspector.get_columns('Service')}:
        op.drop_column('Service', 'show_in_menu')

"""news feed: posted date

Revision ID: f1c7d9e3a5b8
Revises: e8b4f2a6c9d3
Create Date: 2026-10-08 14:00:00.000000

Existing posts have no recorded date; they get the migration time.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'f1c7d9e3a5b8'
down_revision: Union[str, Sequence[str], None] = 'e8b4f2a6c9d3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    inspector = sa.inspect(op.get_bind())
    if 'NewsFeed' not in inspector.get_table_names():
        return  # created complete by create_all at startup
    if 'created_at' not in {c["name"] for c in inspector.get_columns('NewsFeed')}:
        op.add_column('NewsFeed', sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    inspector = sa.inspect(op.get_bind())
    if 'NewsFeed' in inspector.get_table_names() and 'created_at' in {c["name"] for c in inspector.get_columns('NewsFeed')}:
        op.drop_column('NewsFeed', 'created_at')

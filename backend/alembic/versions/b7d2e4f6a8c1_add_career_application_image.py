"""add optional applicant photo to career applications

Revision ID: b7d2e4f6a8c1
Revises: 9c1a7e2b4d10
Create Date: 2026-10-07 22:00:00.000000

Earlier revisions only ever had this column commented out, while the code
expected it, which broke every career query with "column image_url does not
exist". Guarded so it is safe on databases where the column was added by hand.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b7d2e4f6a8c1'
down_revision: Union[str, Sequence[str], None] = '9c1a7e2b4d10'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _columns(table: str) -> set[str]:
    inspector = sa.inspect(op.get_bind())
    if table not in inspector.get_table_names():
        return set()
    return {c["name"] for c in inspector.get_columns(table)}


def upgrade() -> None:
    """Upgrade schema."""
    columns = _columns('career_applications')
    # The table itself is created by Base.metadata.create_all at startup
    if columns and 'image_url' not in columns:
        op.add_column('career_applications', sa.Column('image_url', sa.String(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    if 'image_url' in _columns('career_applications'):
        op.drop_column('career_applications', 'image_url')

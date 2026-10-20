"""portfolio page texts (label, intro, section headings)

Revision ID: e5a7c9d1f3b4
Revises: d4f6b8c0e2a3
Create Date: 2026-10-21 10:00:00.000000

Per-project texts around a case study, edited in the portfolio editor. NULL keeps
the standard wording (existing projects look exactly as before); an empty label or
intro hides it (the title then uses the full width).
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e5a7c9d1f3b4'
down_revision: Union[str, Sequence[str], None] = 'd4f6b8c0e2a3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

COLUMNS = [
    ('overview_label', sa.String(length=120)),
    ('overview_text', sa.Text()),
    ('challenge_heading', sa.String(length=200)),
    ('solution_heading', sa.String(length=200)),
]


def _existing(bind) -> set[str]:
    return {c["name"] for c in sa.inspect(bind).get_columns('Portfolio')}


def upgrade() -> None:
    """Upgrade schema."""
    bind = op.get_bind()
    if 'Portfolio' not in sa.inspect(bind).get_table_names():
        return
    have = _existing(bind)
    for name, type_ in COLUMNS:
        if name not in have:
            op.add_column('Portfolio', sa.Column(name, type_, nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    bind = op.get_bind()
    if 'Portfolio' not in sa.inspect(bind).get_table_names():
        return
    have = _existing(bind)
    with op.batch_alter_table('Portfolio') as batch:
        for name, _ in COLUMNS:
            if name in have:
                batch.drop_column(name)

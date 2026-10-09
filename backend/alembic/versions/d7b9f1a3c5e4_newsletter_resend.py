"""newsletter: unsubscribe tokens, sign-up date

Revision ID: d7b9f1a3c5e4
Revises: c6a8e0f2b4d3
Create Date: 2026-10-10 15:00:00.000000

Existing subscribers get a random unsubscribe token; their sign-up date
stays NULL (unknown).
"""
import secrets
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd7b9f1a3c5e4'
down_revision: Union[str, Sequence[str], None] = 'c6a8e0f2b4d3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = inspector.get_table_names()

    if 'Newsletter' in tables:
        columns = {c["name"] for c in inspector.get_columns('Newsletter')}
        if 'created_at' not in columns:
            op.add_column('Newsletter', sa.Column('created_at', sa.DateTime(timezone=True), nullable=True))
        if 'unsubscribe_token' not in columns:
            op.add_column('Newsletter', sa.Column('unsubscribe_token', sa.String(length=64), nullable=True))
            newsletter = sa.table('Newsletter', sa.column('id', sa.Integer), sa.column('unsubscribe_token', sa.String))
            for (row_id,) in bind.execute(sa.select(newsletter.c.id)).fetchall():
                bind.execute(newsletter.update().where(newsletter.c.id == row_id).values(unsubscribe_token=secrets.token_urlsafe(24)))
            with op.batch_alter_table('Newsletter') as batch:
                batch.alter_column('unsubscribe_token', existing_type=sa.String(length=64), nullable=False)
            op.create_index('ix_Newsletter_unsubscribe_token', 'Newsletter', ['unsubscribe_token'], unique=True)

    # Newsletters are stored in NewsletterIssue (migration e1a3c5d7f9b2). The
    # NewsletterCampaign table belongs to an older schema and is left alone.


def downgrade() -> None:
    """Downgrade schema."""
    inspector = sa.inspect(op.get_bind())
    if 'Newsletter' in inspector.get_table_names():
        columns = {c["name"] for c in inspector.get_columns('Newsletter')}
        if 'unsubscribe_token' in columns:
            op.drop_index('ix_Newsletter_unsubscribe_token', table_name='Newsletter')
            op.drop_column('Newsletter', 'unsubscribe_token')
        if 'created_at' in columns:
            op.drop_column('Newsletter', 'created_at')

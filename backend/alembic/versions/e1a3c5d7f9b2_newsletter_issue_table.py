"""newsletter: NewsletterIssue table for newsletters written in the dashboard

Revision ID: e1a3c5d7f9b2
Revises: d7b9f1a3c5e4
Create Date: 2026-10-10 18:00:00.000000

The table name NewsletterCampaign is taken by an older schema (2900e418b3e1)
that production still has; it is left untouched.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e1a3c5d7f9b2'
down_revision: Union[str, Sequence[str], None] = 'd7b9f1a3c5e4'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    if 'NewsletterIssue' in sa.inspect(op.get_bind()).get_table_names():
        return  # created by create_all at startup on a brand-new database
    op.create_table(
        'NewsletterIssue',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('subject', sa.String(length=200), nullable=False),
        sa.Column('preheader', sa.String(length=200), nullable=True),
        sa.Column('body_html', sa.Text(), nullable=False, server_default=''),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='draft'),
        sa.Column('recipients_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('sent_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('failed_count', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('last_error', sa.Text(), nullable=True),
        sa.Column('created_by', sa.String(length=100), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('sent_at', sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index('ix_NewsletterIssue_id', 'NewsletterIssue', ['id'])


def downgrade() -> None:
    """Downgrade schema."""
    if 'NewsletterIssue' in sa.inspect(op.get_bind()).get_table_names():
        op.drop_table('NewsletterIssue')

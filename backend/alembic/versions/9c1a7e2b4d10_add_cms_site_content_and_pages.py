"""add CMS site content and pages; relax team-branch constraints

Revision ID: 9c1a7e2b4d10
Revises: 5c1edd4c3d37
Create Date: 2026-10-07 21:00:00.000000

The application code no longer writes Blog.slug, Portfolio.url_slug or
Newsletter.status, which earlier migrations made NOT NULL. Those constraints
are relaxed here (data is untouched) so inserts keep working on databases
that already ran those migrations.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '9c1a7e2b4d10'
down_revision: Union[str, Sequence[str], None] = '5c1edd4c3d37'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _inspector():
    return sa.inspect(op.get_bind())


def _has_table(name: str) -> bool:
    return name in _inspector().get_table_names()


def _has_column(table: str, column: str) -> bool:
    return _has_table(table) and column in {c["name"] for c in _inspector().get_columns(table)}


def upgrade() -> None:
    """Upgrade schema."""
    # Guarded: environments that ran Base.metadata.create_all may already have these
    if not _has_table('SiteContent'):
        op.create_table('SiteContent',
        sa.Column('key', sa.String(length=100), nullable=False),
        sa.Column('data', sa.Text(), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('key')
        )

    if not _has_table('Page'):
        op.create_table('Page',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(length=200), nullable=False),
        sa.Column('slug', sa.String(length=150), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('meta_title', sa.String(length=200), nullable=True),
        sa.Column('meta_description', sa.Text(), nullable=True),
        sa.Column('is_published', sa.Boolean(), nullable=False),
        sa.Column('show_in_footer', sa.Boolean(), nullable=False),
        sa.Column('footer_order', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.PrimaryKeyConstraint('id')
        )
        op.create_index(op.f('ix_Page_id'), 'Page', ['id'], unique=False)
        op.create_index(op.f('ix_Page_slug'), 'Page', ['slug'], unique=True)

    if _has_column('Blog', 'slug'):
        op.alter_column('Blog', 'slug', existing_type=sa.String(length=220), nullable=True)

    if _has_column('Portfolio', 'url_slug'):
        op.alter_column('Portfolio', 'url_slug', existing_type=sa.String(length=255), nullable=True)

    if _has_column('Newsletter', 'status'):
        op.alter_column('Newsletter', 'status', existing_type=sa.String(length=30),
                        server_default=sa.text("'ACTIVE'"))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_Page_slug'), table_name='Page')
    op.drop_index(op.f('ix_Page_id'), table_name='Page')
    op.drop_table('Page')
    op.drop_table('SiteContent')

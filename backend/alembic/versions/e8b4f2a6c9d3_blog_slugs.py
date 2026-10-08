"""blog slugs: ensure column/index and give every post a slug

Revision ID: e8b4f2a6c9d3
Revises: d3a9c5e7f1b2
Create Date: 2026-10-08 12:00:00.000000

Posts created while the code ignored Blog.slug have NULL slugs; give each a
unique one derived from its title so every post has a /blog/<slug> URL.
"""
import re
import unicodedata
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e8b4f2a6c9d3'
down_revision: Union[str, Sequence[str], None] = 'd3a9c5e7f1b2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _slugify(value: str) -> str:
    text = unicodedata.normalize("NFKD", value or "").encode("ascii", "ignore").decode()
    text = re.sub(r"[^a-zA-Z0-9]+", "-", text.replace("&", " and ")).strip("-").lower()
    return text[:200].rstrip("-") or "post"


def upgrade() -> None:
    """Upgrade schema."""
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if 'Blog' not in inspector.get_table_names():
        return  # created complete by create_all at startup

    columns = {c["name"] for c in inspector.get_columns('Blog')}
    if 'slug' not in columns:
        op.add_column('Blog', sa.Column('slug', sa.String(length=220), nullable=True))
    indexes = {i["name"] for i in inspector.get_indexes('Blog')}
    if 'ix_Blog_slug' not in indexes:
        op.create_index('ix_Blog_slug', 'Blog', ['slug'], unique=True)

    blog = sa.table('Blog', sa.column('id', sa.Integer), sa.column('title', sa.String), sa.column('slug', sa.String))
    taken = {row.slug for row in bind.execute(sa.select(blog.c.slug).where(blog.c.slug.isnot(None)))}
    for row in bind.execute(sa.select(blog.c.id, blog.c.title).where(sa.or_(blog.c.slug.is_(None), blog.c.slug == ''))).fetchall():
        base = _slugify(row.title)
        slug, n = base, 2
        while slug in taken:
            slug, n = f"{base}-{n}", n + 1
        taken.add(slug)
        bind.execute(blog.update().where(blog.c.id == row.id).values(slug=slug))


def downgrade() -> None:
    """Downgrade schema."""
    # Slugs are kept; earlier revisions already own the column and index.
    pass

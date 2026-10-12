"""portfolio: URL slugs and managed categories

Revision ID: d4f6a8c0e2b3
Revises: c2d4e6f8a0b1
Create Date: 2026-10-13 10:00:00.000000

Every project gets a unique slug from its title (/portfolio/<slug>; old
/portfolio/<id> links redirect). Existing category names become managed
portfolio categories (same name in any case = one category, most used
spelling), plus the built-in "Others" and the four categories the old form
offered.
"""
import re
import unicodedata
from datetime import datetime, timezone
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'd4f6a8c0e2b3'
down_revision: Union[str, Sequence[str], None] = 'c2d4e6f8a0b1'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

DEFAULTS = ["Web Development", "Graphic Design", "UI/UX Design", "App Development"]


def _slugify(value: str) -> str:
    text = unicodedata.normalize("NFKD", value or "").encode("ascii", "ignore").decode()
    text = re.sub(r"[^a-zA-Z0-9]+", "-", text.replace("&", " and ")).strip("-").lower()
    return text[:200].rstrip("-") or "project"


def upgrade() -> None:
    """Upgrade schema."""
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = inspector.get_table_names()
    if 'Portfolio' not in tables:
        return  # created complete by create_all at startup

    columns = {c["name"] for c in inspector.get_columns('Portfolio')}
    if 'slug' not in columns:
        op.add_column('Portfolio', sa.Column('slug', sa.String(length=220), nullable=True))
    if 'category_id' not in columns:
        op.add_column('Portfolio', sa.Column('category_id', sa.Integer(), nullable=True))
        op.create_index('ix_Portfolio_category_id', 'Portfolio', ['category_id'])

    portfolio = sa.table('Portfolio', sa.column('id', sa.Integer), sa.column('project_title', sa.String),
                         sa.column('slug', sa.String), sa.column('category_node', sa.String), sa.column('category_id', sa.Integer))
    rows = bind.execute(sa.select(portfolio.c.id, portfolio.c.project_title, portfolio.c.slug, portfolio.c.category_node)
                        .order_by(portfolio.c.id)).fetchall()

    # ---- slugs (oldest project keeps the plain slug)
    used = {r.slug for r in rows if r.slug}
    for r in rows:
        if r.slug:
            continue
        base = _slugify(r.project_title)
        slug, n = base, 2
        while slug in used:
            slug, n = f"{base}-{n}", n + 1
        used.add(slug)
        bind.execute(portfolio.update().where(portfolio.c.id == r.id).values(slug=slug))
    indexes = {i["name"] for i in sa.inspect(bind).get_indexes('Portfolio')}
    if 'ix_Portfolio_slug' not in indexes:
        op.create_index('ix_Portfolio_slug', 'Portfolio', ['slug'], unique=True)

    # ---- categories (same approach as services and blog posts)
    if 'Category' not in tables:
        return
    category = sa.table('Category', sa.column('id', sa.Integer), sa.column('kind', sa.String), sa.column('name', sa.String),
                        sa.column('sort_order', sa.Integer), sa.column('show_in_menu', sa.Boolean), sa.column('is_system', sa.Boolean),
                        sa.column('created_at', sa.DateTime))
    now = datetime.now(timezone.utc)
    existing = {row.name.lower(): row.id for row in bind.execute(sa.select(category.c.id, category.c.name).where(category.c.kind == 'portfolio'))}

    def ensure(name, order, system=False):
        key = name.lower()
        if key not in existing:
            bind.execute(category.insert().values(kind='portfolio', name=name, sort_order=order, show_in_menu=True, is_system=system, created_at=now))
            existing[key] = bind.execute(sa.select(category.c.id).where(category.c.kind == 'portfolio', sa.func.lower(category.c.name) == key)).scalar()
        return existing[key]

    others_id = ensure("Others", 10000, system=True)
    variants = {}
    for r in rows:
        clean = (r.category_node or "").strip()
        if clean:
            variants.setdefault(clean.lower(), {}).setdefault(clean, 0)
            variants[clean.lower()][clean] += 1
    spelling = {key: max(counts, key=lambda v: (counts[v], sum(ch.isupper() for ch in v))) for key, counts in variants.items()}
    order = 1
    for name in sorted(spelling.values(), key=str.lower) + DEFAULTS:   # categories in use first
        if name.lower() not in existing:
            ensure(name, order)
            order += 1
    canonical = {row.name.lower(): (row.id, row.name) for row in bind.execute(sa.select(category.c.id, category.c.name).where(category.c.kind == 'portfolio'))}
    for r in rows:
        clean = (r.category_node or "").strip()
        cid, label = canonical.get(clean.lower(), (others_id, "Others")) if clean else (others_id, "Others")
        bind.execute(portfolio.update().where(portfolio.c.id == r.id).values(category_id=cid, category_node=label))


def downgrade() -> None:
    """Downgrade schema."""
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    if 'Portfolio' not in inspector.get_table_names():
        return
    indexes = {i["name"] for i in inspector.get_indexes('Portfolio')}
    columns = {c["name"] for c in inspector.get_columns('Portfolio')}
    for index in ('ix_Portfolio_slug', 'ix_Portfolio_category_id'):
        if index in indexes:
            op.drop_index(index, table_name='Portfolio')
    for column in ('slug', 'category_id'):
        if column in columns:
            op.drop_column('Portfolio', column)
    if 'Category' in inspector.get_table_names():
        bind.execute(sa.text("DELETE FROM \"Category\" WHERE kind = 'portfolio'"))

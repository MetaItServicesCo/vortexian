"""categories for services and blog posts

Revision ID: b8d0f2a4c6e7
Revises: a7c9e1b3d5f6
Create Date: 2026-10-10 12:00:00.000000

Existing category names become managed categories (same name in any case =
one category), plus the built-in "Others" per kind. Services also keep the
three categories the old form offered (Marketing, Design, Technology).
"""
from datetime import datetime, timezone
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b8d0f2a4c6e7'
down_revision: Union[str, Sequence[str], None] = 'a7c9e1b3d5f6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

ITEMS = {"service": ("Service", "category_stack"), "blog": ("Blog", "category")}
DEFAULTS = {"service": ["Marketing", "Design", "Technology"], "blog": []}


def upgrade() -> None:
    """Upgrade schema."""
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    tables = inspector.get_table_names()

    if 'Category' not in tables:
        op.create_table(
            'Category',
            sa.Column('id', sa.Integer(), primary_key=True),
            sa.Column('kind', sa.String(length=20), nullable=False),
            sa.Column('name', sa.String(length=100), nullable=False),
            sa.Column('sort_order', sa.Integer(), nullable=False, server_default='0'),
            sa.Column('show_in_menu', sa.Boolean(), nullable=False, server_default=sa.true()),
            sa.Column('is_system', sa.Boolean(), nullable=False, server_default=sa.false()),
            sa.Column('created_at', sa.DateTime(timezone=True), nullable=True),
        )
        op.create_index('ix_Category_id', 'Category', ['id'])
        op.create_index('ix_Category_kind', 'Category', ['kind'])

    for table, _ in ITEMS.values():
        if table in tables and 'category_id' not in {c["name"] for c in inspector.get_columns(table)}:
            op.add_column(table, sa.Column('category_id', sa.Integer(), nullable=True))
            op.create_index(f'ix_{table}_category_id', table, ['category_id'])

    category = sa.table('Category', sa.column('id', sa.Integer), sa.column('kind', sa.String), sa.column('name', sa.String),
                        sa.column('sort_order', sa.Integer), sa.column('show_in_menu', sa.Boolean), sa.column('is_system', sa.Boolean),
                        sa.column('created_at', sa.DateTime))
    now = datetime.now(timezone.utc)

    for kind, (table, column) in ITEMS.items():
        if table not in tables:
            continue
        existing = {row.name.lower(): row.id for row in bind.execute(sa.select(category.c.id, category.c.name).where(category.c.kind == kind))}

        def ensure(name, order, system=False):
            key = name.lower()
            if key not in existing:
                bind.execute(category.insert().values(kind=kind, name=name, sort_order=order, show_in_menu=True, is_system=system, created_at=now))
                existing[key] = bind.execute(sa.select(category.c.id).where(category.c.kind == kind, sa.func.lower(category.c.name) == key)).scalar()
            return existing[key]

        others_id = ensure("Others", 10000, system=True)
        items = sa.table(table, sa.column('id', sa.Integer), sa.column(column, sa.String), sa.column('category_id', sa.Integer))
        rows = bind.execute(sa.select(items.c.id, items.c[column])).fetchall()
        # One category per name in any case; its spelling is the most used one
        # (ties: the one with more capitals, e.g. "SEO" over "seo")
        variants = {}
        for _, name in rows:
            clean = (name or "").strip()
            if clean:
                variants.setdefault(clean.lower(), {}).setdefault(clean, 0)
                variants[clean.lower()][clean] += 1
        spelling = {key: max(counts, key=lambda v: (counts[v], sum(ch.isupper() for ch in v))) for key, counts in variants.items()}
        order = 1
        for name in DEFAULTS[kind] + sorted(spelling.values(), key=str.lower):
            if name.lower() not in existing:
                ensure(name, order)
                order += 1
        canonical = {row.name.lower(): (row.id, row.name) for row in bind.execute(sa.select(category.c.id, category.c.name).where(category.c.kind == kind))}
        for row_id, name in rows:
            clean = (name or "").strip()
            cid, label = canonical.get(clean.lower(), (others_id, "Others")) if clean else (others_id, "Others")
            bind.execute(items.update().where(items.c.id == row_id).values(category_id=cid, **{column: label}))


def downgrade() -> None:
    """Downgrade schema."""
    inspector = sa.inspect(op.get_bind())
    for table, _ in ITEMS.values():
        if table in inspector.get_table_names() and 'category_id' in {c["name"] for c in inspector.get_columns(table)}:
            op.drop_index(f'ix_{table}_category_id', table_name=table)
            op.drop_column(table, 'category_id')
    if 'Category' in inspector.get_table_names():
        op.drop_table('Category')

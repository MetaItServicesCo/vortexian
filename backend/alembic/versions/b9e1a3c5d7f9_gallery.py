"""gallery: albums, photos, categories, menu links

Revision ID: b9e1a3c5d7f9
Revises: a8d0f2b4c6e8
Create Date: 2026-10-17 10:00:00.000000

Adds the Gallery (public /gallery). Gallery categories are managed in
Dashboard → Categories → Gallery; the five suggested ones are created here.
"Gallery" is added to the saved header menu (under ABOUT) and the footer
links, unless a link to /gallery is already there.
"""
import json
from datetime import datetime, timezone
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b9e1a3c5d7f9'
down_revision: Union[str, Sequence[str], None] = 'a8d0f2b4c6e8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

CATEGORIES = ["Company Events", "Team Activities", "Meetings", "Training & Workshops", "Company Achievements"]
LINK = {"label": "Gallery", "href": "/gallery"}


def _has_gallery_link(items) -> bool:
    for item in items or []:
        if isinstance(item, dict) and (str(item.get("href", "")).rstrip("/") == "/gallery" or _has_gallery_link(item.get("children"))):
            return True
    return False


def upgrade() -> None:
    """Upgrade schema."""
    bind = op.get_bind()
    tables = sa.inspect(bind).get_table_names()

    if 'GalleryAlbum' not in tables:
        op.create_table(
            'GalleryAlbum',
            sa.Column('id', sa.Integer(), primary_key=True),
            sa.Column('title', sa.String(length=150), nullable=False),
            sa.Column('slug', sa.String(length=180), nullable=False),
            sa.Column('description', sa.Text(), nullable=True),
            sa.Column('event_date', sa.String(length=10), nullable=True),
            sa.Column('cover_image_id', sa.Integer(), nullable=True),
            sa.Column('sort_order', sa.Integer(), nullable=False, server_default='0'),
            sa.Column('is_published', sa.Boolean(), nullable=False, server_default=sa.false()),
            sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
            sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        )
        op.create_index('ix_GalleryAlbum_id', 'GalleryAlbum', ['id'])
        op.create_index('ix_GalleryAlbum_slug', 'GalleryAlbum', ['slug'], unique=True)

    if 'GalleryImage' not in tables:
        op.create_table(
            'GalleryImage',
            sa.Column('id', sa.Integer(), primary_key=True),
            sa.Column('album_id', sa.Integer(), nullable=True),
            sa.Column('category_id', sa.Integer(), nullable=True),
            sa.Column('category_name', sa.String(length=100), nullable=False, server_default='Others'),
            sa.Column('title', sa.String(length=150), nullable=False),
            sa.Column('caption', sa.Text(), nullable=True),
            sa.Column('event_name', sa.String(length=150), nullable=True),
            sa.Column('event_date', sa.String(length=10), nullable=True),
            sa.Column('alt', sa.String(length=255), nullable=False),
            sa.Column('path', sa.String(length=300), nullable=False),
            sa.Column('path_large', sa.String(length=300), nullable=False),
            sa.Column('path_medium', sa.String(length=300), nullable=False),
            sa.Column('path_thumb', sa.String(length=300), nullable=False),
            sa.Column('width', sa.Integer(), nullable=False, server_default='0'),
            sa.Column('height', sa.Integer(), nullable=False, server_default='0'),
            sa.Column('file_size', sa.Integer(), nullable=False, server_default='0'),
            sa.Column('sort_order', sa.Integer(), nullable=False, server_default='0'),
            sa.Column('is_published', sa.Boolean(), nullable=False, server_default=sa.false()),
            sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
            sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        )
        for col in ('id', 'album_id', 'category_id', 'sort_order'):
            op.create_index(f'ix_GalleryImage_{col}', 'GalleryImage', [col])

    # ---- suggested categories (+ the built-in "Others")
    if 'Category' in tables:
        category = sa.table('Category', sa.column('kind', sa.String), sa.column('name', sa.String), sa.column('sort_order', sa.Integer),
                            sa.column('show_in_menu', sa.Boolean), sa.column('is_system', sa.Boolean), sa.column('created_at', sa.DateTime))
        existing = {r[0].lower() for r in bind.execute(sa.select(category.c.name).where(category.c.kind == 'gallery'))}
        now = datetime.now(timezone.utc)
        for n, name in enumerate(CATEGORIES + ["Others"], start=1):
            if name.lower() not in existing:
                bind.execute(category.insert().values(kind='gallery', name=name, sort_order=10000 if name == "Others" else n,
                                                      show_in_menu=True, is_system=name == "Others", created_at=now))

    # ---- menu links in the saved header and footer
    if 'SiteContent' in tables:
        content = sa.table('SiteContent', sa.column('key', sa.String), sa.column('data', sa.Text))
        for key in ('header', 'footer'):
            row = bind.execute(sa.select(content.c.data).where(content.c.key == key)).first()
            if not row:
                continue   # not customised: the defaults (src/content/registry.js) already include Gallery
            try:
                data = json.loads(row[0] or "{}")
            except ValueError:
                continue
            changed = False
            if key == 'header' and isinstance(data.get("menu"), list) and not _has_gallery_link(data["menu"]):
                about = next((m for m in data["menu"] if isinstance(m, dict) and str(m.get("label", "")).strip().lower() == "about"), None)
                if about is not None:
                    about.setdefault("children", []).append(dict(LINK))
                    changed = True
            if key == 'footer' and isinstance(data.get("explore_links"), list) and not _has_gallery_link(data["explore_links"]):
                data["explore_links"].append(dict(LINK))
                changed = True
            if changed:
                bind.execute(content.update().where(content.c.key == key).values(data=json.dumps(data, ensure_ascii=False)))


def downgrade() -> None:
    """Downgrade schema (menu links are left in place)."""
    bind = op.get_bind()
    tables = sa.inspect(bind).get_table_names()
    for table in ('GalleryImage', 'GalleryAlbum'):
        if table in tables:
            op.drop_table(table)
    if 'Category' in tables:
        bind.execute(sa.text("DELETE FROM \"Category\" WHERE kind = 'gallery'"))

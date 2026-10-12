"""media library

Revision ID: e6b8d0f2a4c5
Revises: d4f6a8c0e2b3
Create Date: 2026-10-13 14:00:00.000000

Images already uploaded through the rich text editor (uploads/media/) are
listed in the new Media Library so their links can be copied too.
"""
import os
from datetime import datetime, timezone
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e6b8d0f2a4c5'
down_revision: Union[str, Sequence[str], None] = 'd4f6a8c0e2b3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

IMAGES = {"jpg", "jpeg", "png", "gif", "webp", "avif"}


def upgrade() -> None:
    """Upgrade schema."""
    bind = op.get_bind()
    if 'MediaItem' not in sa.inspect(bind).get_table_names():
        op.create_table(
            'MediaItem',
            sa.Column('id', sa.Integer(), primary_key=True),
            sa.Column('path', sa.String(length=300), nullable=False),
            sa.Column('title', sa.String(length=200), nullable=False, server_default=''),
            sa.Column('alt', sa.String(length=255), nullable=True),
            sa.Column('file_size', sa.Integer(), nullable=False, server_default='0'),
            sa.Column('uploaded_by', sa.String(length=100), nullable=True),
            sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
            sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        )
        op.create_index('ix_MediaItem_id', 'MediaItem', ['id'])
        op.create_index('ix_MediaItem_path', 'MediaItem', ['path'], unique=True)
        op.create_index('ix_MediaItem_created_at', 'MediaItem', ['created_at'])

    # List images the editor already uploaded (oldest first, dated by the file)
    folder = os.path.join("uploads", "media")
    if not os.path.isdir(folder):
        return
    media = sa.table('MediaItem', sa.column('path', sa.String), sa.column('title', sa.String),
                     sa.column('file_size', sa.Integer), sa.column('created_at', sa.DateTime))
    known = {row[0] for row in bind.execute(sa.select(media.c.path))}
    files = sorted((f for f in os.listdir(folder) if os.path.splitext(f)[1].lstrip(".").lower() in IMAGES),
                   key=lambda f: os.path.getmtime(os.path.join(folder, f)))
    for name in files:
        path = f"/uploads/media/{name}"
        if path in known:
            continue
        full = os.path.join(folder, name)
        bind.execute(media.insert().values(
            path=path, title="Image from the editor", file_size=os.path.getsize(full),
            created_at=datetime.fromtimestamp(os.path.getmtime(full), timezone.utc)))


def downgrade() -> None:
    """Downgrade schema."""
    if 'MediaItem' in sa.inspect(op.get_bind()).get_table_names():
        op.drop_table('MediaItem')

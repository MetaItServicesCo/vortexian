"""AI assistant: chat sessions, chat leads, knowledge base state

Revision ID: c2d4e6f8a0b1
Revises: b8d0f2a4c6e7
Create Date: 2026-10-12 18:00:00.000000

The knowledge base vectors live in the pgvector table ai_kb_chunks. It is
created by the app (app/ai/knowledge.py, ensure_store) rather than here, so
the website keeps working on a database without the pgvector extension and
the table appears as soon as the extension is installed.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c2d4e6f8a0b1'
down_revision: Union[str, Sequence[str], None] = 'b8d0f2a4c6e7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    tables = sa.inspect(op.get_bind()).get_table_names()

    if 'AIChatSession' not in tables:
        op.create_table(
            'AIChatSession',
            sa.Column('id', sa.String(length=36), primary_key=True),
            sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
            sa.Column('last_seen_at', sa.DateTime(timezone=True), nullable=False),
            sa.Column('first_page', sa.String(length=300), nullable=True),
            sa.Column('messages', sa.Text(), nullable=False, server_default='[]'),
            sa.Column('state', sa.Text(), nullable=False, server_default='{}'),
            sa.Column('user_messages', sa.Integer(), nullable=False, server_default='0'),
            sa.Column('ip_hash', sa.String(length=64), nullable=True),
        )
        op.create_index('ix_AIChatSession_last_seen_at', 'AIChatSession', ['last_seen_at'])
        op.create_index('ix_AIChatSession_ip_hash', 'AIChatSession', ['ip_hash'])

    if 'AIChatLead' not in tables:
        op.create_table(
            'AIChatLead',
            sa.Column('id', sa.Integer(), primary_key=True),
            sa.Column('session_id', sa.String(length=36), nullable=True),
            sa.Column('name', sa.String(length=150), nullable=True),
            sa.Column('email', sa.String(length=254), nullable=True),
            sa.Column('phone', sa.String(length=50), nullable=True),
            sa.Column('company', sa.String(length=200), nullable=True),
            sa.Column('need', sa.Text(), nullable=True),
            sa.Column('page', sa.String(length=300), nullable=True),
            sa.Column('transcript', sa.Text(), nullable=False, server_default='[]'),
            sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
            sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        )
        op.create_index('ix_AIChatLead_id', 'AIChatLead', ['id'])
        op.create_index('ix_AIChatLead_session_id', 'AIChatLead', ['session_id'])
        op.create_index('ix_AIChatLead_created_at', 'AIChatLead', ['created_at'])

    if 'AIKnowledgeState' not in tables:
        op.create_table(
            'AIKnowledgeState',
            sa.Column('id', sa.Integer(), primary_key=True),
            sa.Column('status', sa.String(length=20), nullable=False, server_default='empty'),
            sa.Column('message', sa.Text(), nullable=True),
            sa.Column('pages', sa.Integer(), nullable=False, server_default='0'),
            sa.Column('chunks', sa.Integer(), nullable=False, server_default='0'),
            sa.Column('embedding_model', sa.String(length=200), nullable=True),
            sa.Column('changed_at', sa.DateTime(timezone=True), nullable=True),
            sa.Column('indexed_at', sa.DateTime(timezone=True), nullable=True),
            sa.Column('started_at', sa.DateTime(timezone=True), nullable=True),
        )


def downgrade() -> None:
    """Downgrade schema."""
    tables = sa.inspect(op.get_bind()).get_table_names()
    for table in ('AIKnowledgeState', 'AIChatLead', 'AIChatSession'):
        if table in tables:
            op.drop_table(table)

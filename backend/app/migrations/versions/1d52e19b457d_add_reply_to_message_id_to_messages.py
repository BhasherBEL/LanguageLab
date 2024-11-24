"""Add reply_to_message_id to messages

Revision ID: 1d52e19b457d
Revises: c8a10716a14d
Create Date: 2024-11-13 14:56:23.375661

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "1d52e19b457d"
down_revision: Union[str, None] = "c8a10716a14d"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.add_column(
        "messages", sa.Column("reply_to_message_id", sa.Integer(), nullable=True)
    )
    op.create_foreign_key(None, "messages", "messages", ["reply_to_message_id"], ["id"])


def downgrade():
    op.drop_constraint(None, "messages", type_="foreignkey")
    op.drop_column("messages", "reply_to_message_id")

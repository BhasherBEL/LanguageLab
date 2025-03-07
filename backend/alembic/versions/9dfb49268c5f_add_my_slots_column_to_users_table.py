"""Add my_slots column to users table

Revision ID: 9dfb49268c5f
Revises: ce5a922c7fc4
Create Date: 2025-02-23 18:48:24.958552

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "9dfb49268c5f"
down_revision: Union[str, None] = "ce5a922c7fc4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.add_column(
        "users", sa.Column("my_slots", sa.JSON, nullable=False, server_default="[]")
    )


def downgrade():
    op.drop_column("users", "my_slots")

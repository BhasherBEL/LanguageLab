"""Add max_learners column to user table

Revision ID: add_max_learners_to_user_table
Revises: ce5a922c7fc4
Create Date: 2024-01-15 10:00:00.000000

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "add_max_learners_to_user_table"
down_revision: Union[str, None] = "9dfb49268c5f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.add_column("users", sa.Column("max_learners", sa.Integer, default=10))


def downgrade():
    op.drop_column("users", "max_learners")

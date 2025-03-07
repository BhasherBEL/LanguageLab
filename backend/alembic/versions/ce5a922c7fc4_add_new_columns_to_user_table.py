"""Add new columns to user table

Revision ID: ce5a922c7fc4
Revises: fe09c6f768cd
Create Date: 2025-02-23 12:01:52.379157

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "ce5a922c7fc4"
down_revision: Union[str, None] = "fe09c6f768cd"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.add_column("users", sa.Column("availabilities", sa.JSON, default=[]))
    op.add_column("users", sa.Column("tutor_list", sa.JSON, default=[]))
    op.add_column("users", sa.Column("my_tutor", sa.String, default=""))
    op.add_column("users", sa.Column("bio", sa.String, default=""))


def downgrade():
    op.drop_column("users", "availabilities")
    op.drop_column("users", "tutor_list")
    op.drop_column("users", "my_tutor")
    op.drop_column("users", "bio")

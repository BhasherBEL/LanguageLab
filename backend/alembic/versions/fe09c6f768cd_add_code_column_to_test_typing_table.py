"""Add code column to test_typing table

Revision ID: fe09c6f768cd
Revises: 9038306d44fc
Create Date: 2025-01-31 21:45:56.343739

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "fe09c6f768cd"
down_revision: Union[str, None] = "0bf670c4a564"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:

    op.create_table(
        "_tmp_test_typing",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("code", sa.String(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )

    op.drop_table("test_typing")
    op.rename_table("_tmp_test_typing", "test_typing")

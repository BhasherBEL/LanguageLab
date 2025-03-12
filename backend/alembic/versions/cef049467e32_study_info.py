"""Study info

Revision ID: cef049467e32
Revises: c4ff1cfa66b7
Create Date: 2025-03-13 00:19:21.655377

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "cef049467e32"
down_revision: Union[str, None] = "c4ff1cfa66b7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    op.drop_table("study_infos")

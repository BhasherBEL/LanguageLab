"""Fix option select ID

Revision ID: fef1bc2f323b
Revises: 5fa98384cecc
Create Date: 2025-07-10 09:41:17.293192

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "fef1bc2f323b"
down_revision: Union[str, None] = "5fa98384cecc"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute(
        "UPDATE test_entries_task_qcm SET selected_id = selected_id + 1 WHERE entry_id <= 29921"
    )


def downgrade() -> None:
    op.execute(
        "UPDATE test_entries_task_qcm SET selected_id = selected_id - 1 WHERE entry_id <= 29921"
    )

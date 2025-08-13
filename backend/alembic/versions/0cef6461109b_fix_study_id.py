"""Fix study ID

Revision ID: 0cef6461109b
Revises: fef1bc2f323b
Create Date: 2025-07-23 10:55:14.306122

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "0cef6461109b"
down_revision: Union[str, None] = "fef1bc2f323b"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade():
    op.execute(
        """
        CREATE TABLE temp_swap_group_id AS 
        SELECT tet.entry_id, tet.test_group_id
        FROM test_entries_task tet
        JOIN test_entries_task_gapfill tgtg ON tet.entry_id = tgtg.entry_id
    """
    )
    op.execute(
        """
        UPDATE test_entries_task
        SET test_group_id = (
            SELECT study_id FROM test_entries te WHERE te.id = test_entries_task.entry_id
        )
        WHERE entry_id IN (SELECT entry_id FROM test_entries_task_gapfill)
    """
    )
    op.execute(
        """
        UPDATE test_entries
        SET study_id = (
            SELECT test_group_id FROM temp_swap_group_id t WHERE t.entry_id = test_entries.id
        )
        WHERE id IN (SELECT entry_id FROM temp_swap_group_id)
    """
    )
    op.execute("DROP TABLE temp_swap_group_id")


def downgrade():
    op.execute(
        """
        CREATE TABLE temp_swap_study_id AS 
        SELECT te.id as entry_id, te.study_id
        FROM test_entries te
        JOIN test_entries_task_gapfill tgtg ON te.id = tgtg.entry_id
    """
    )
    op.execute(
        """
        UPDATE test_entries
        SET study_id = (
            SELECT test_group_id FROM test_entries_task tet WHERE tet.entry_id = test_entries.id
        )
        WHERE id IN (SELECT entry_id FROM test_entries_task_gapfill)
    """
    )
    op.execute(
        """
        UPDATE test_entries_task
        SET test_group_id = (
            SELECT study_id FROM temp_swap_study_id t WHERE t.entry_id = test_entries_task.entry_id
        )
        WHERE entry_id IN (SELECT entry_id FROM temp_swap_study_id)
    """
    )
    op.execute("DROP TABLE temp_swap_study_id")

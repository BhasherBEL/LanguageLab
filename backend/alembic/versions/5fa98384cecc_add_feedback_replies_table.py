"""add feedback replies table

Revision ID: 5fa98384cecc
Revises: add_max_learners_to_user_table, cef049467e32
Create Date: 2025-06-26 03:41:41.223160

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "5fa98384cecc"
down_revision: Union[str, None] = ("add_max_learners_to_user_table", "cef049467e32")
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Create feedback_replies table
    op.create_table(
        "feedback_replies",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("feedback_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("content", sa.String(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.Column("deleted_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["feedback_id"], ["message_feedbacks.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(
        op.f("ix_feedback_replies_id"), "feedback_replies", ["id"], unique=False
    )
    op.create_index(
        op.f("ix_feedback_replies_feedback_id"),
        "feedback_replies",
        ["feedback_id"],
        unique=False,
    )
    op.create_index(
        op.f("ix_feedback_replies_user_id"),
        "feedback_replies",
        ["user_id"],
        unique=False,
    )


def downgrade() -> None:
    # Drop feedback_replies table
    op.drop_index(
        op.f("ix_feedback_replies_user_id"), table_name="feedback_replies"
    )
    op.drop_index(
        op.f("ix_feedback_replies_feedback_id"), table_name="feedback_replies"
    )
    op.drop_index(op.f("ix_feedback_replies_id"), table_name="feedback_replies")
    op.drop_table("feedback_replies")
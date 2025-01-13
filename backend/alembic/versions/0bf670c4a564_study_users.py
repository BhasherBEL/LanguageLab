"""study users

Revision ID: 0bf670c4a564
Revises: 37f4cc82f93e
Create Date: 2025-01-12 19:33:40.885741

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "0bf670c4a564"
down_revision: Union[str, None] = "37f4cc82f93e"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "study_users",
        sa.Column("study_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["study_id"], ["studies.id"]),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("study_id", "user_id"),
    )

    op.create_table(
        "study_surveys",
        sa.Column("study_id", sa.Integer(), nullable=False),
        sa.Column("survey_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["study_id"], ["studies.id"]),
        sa.ForeignKeyConstraint(["survey_id"], ["survey_surveys.id"]),
        sa.PrimaryKeyConstraint("study_id", "survey_id"),
    )

    op.add_column("studies", sa.Column("typing_test", sa.Boolean(), nullable=True))

    op.drop_column("users", "study_id")


def downgrade() -> None:
    op.add_column("users", sa.Column("study_id", sa.Integer(), nullable=True))
    op.create_foreign_key(None, "users", "studies", ["study_id"], ["id"])

    op.drop_column("studies", "typing_test")

    op.drop_table("study_surveys")
    op.drop_table("study_users")

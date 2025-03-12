"""study_data_divided_in_more_field

Revision ID: c4ff1cfa66b7
Revises: 344d94d32fa1
Create Date: 2025-03-11 15:37:02.225207

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "c4ff1cfa66b7"
down_revision: Union[str, None] = "344d94d32fa1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table("studies") as batch_op:
        batch_op.drop_column("consent_study_data")
        batch_op.add_column(
            sa.Column(
                "study_data_organisation", sa.String, nullable=False, server_default=""
            ),
        )
        batch_op.add_column(
            sa.Column(
                "study_data_address", sa.String, nullable=False, server_default=""
            ),
        )
        batch_op.add_column(
            sa.Column(
                "study_data_contact", sa.String, nullable=False, server_default=""
            ),
        )
        batch_op.add_column(
            sa.Column("study_data_email", sa.String, nullable=False, server_default=""),
        )

    with op.batch_alter_table("studies") as batch_op:
        batch_op.alter_column("study_data_organisation", server_default=None)
        batch_op.alter_column("study_data_address", server_default=None)
        batch_op.alter_column("study_data_contact", server_default=None)
        batch_op.alter_column("study_data_email", server_default=None)


def downgrade() -> None:
    with op.batch_alter_table("studies") as batch_op:
        batch_op.add_column(
            sa.Column(
                "consent_study_data", sa.String, nullable=False, server_default=""
            ),
        )
        batch_op.drop_column("study_data_organisation")
        batch_op.drop_column("study_data_address")
        batch_op.drop_column("study_data_contact")
        batch_op.drop_column("study_data_email")

    op.alter_column("studies", "consent_study_data", server_default=None)

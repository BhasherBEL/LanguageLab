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
    op.drop_column("studies", "consent_study_data")
    op.add_column(
        "studies", sa.Column("study_data_organisation", sa.String, nullable=False, server_default="")
    )
    op.add_column("studies", sa.Column("study_data_address", sa.String, nullable=False, server_default=""))
    op.add_column("studies", sa.Column("study_data_contact", sa.String, nullable=False, server_default=""))
    op.add_column("studies", sa.Column("study_data_email", sa.String, nullable=False, server_default=""))


def downgrade() -> None:
    op.add_column("studies", sa.Column("consent_study_data", sa.String, nullable=False, server_default=""))
    op.drop_column("studies", "study_data_organisation")
    op.drop_column("studies", "study_data_address")
    op.drop_column("studies", "study_data_contact")
    op.drop_column("studies", "study_data_email")

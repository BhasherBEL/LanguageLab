"""Update survey response with other languages

Revision ID: 37f4cc82f93e
Revises: 
Create Date: 2024-12-22 18:42:42.049100

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "37f4cc82f93e"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("survey_response_info", sa.Column("other_language", sa.String))
    op.drop_column("messages", "reply_to_message_id")
    op.add_column("messages", sa.Column("reply_to_message_id", sa.Integer))


def downgrade() -> None:
    pass

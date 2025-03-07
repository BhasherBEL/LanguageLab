"""New studies & tests logic

Revision ID: 344d94d32fa1
Revises: 9dfb49268c5f
Create Date: 2025-03-07 15:43:38.917230

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "344d94d32fa1"
down_revision: Union[str, None] = "9dfb49268c5f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    with op.batch_alter_table("studies") as batch_op:
        batch_op.drop_column("chat_duration")
        batch_op.add_column(
            sa.Column("nb_session", sa.Integer, nullable=False, server_default="8")
        )
        batch_op.add_column(
            sa.Column(
                "consent_participation",
                sa.String,
                nullable=False,
                server_default="Si vous acceptez de participer, vous devrez seulement répondre à ce questionnaire et éventuellement à un autre test, si indiqué par la personne qui administre le test.",
            )
        )
        batch_op.add_column(
            sa.Column(
                "consent_privacy",
                sa.String,
                nullable=False,
                server_default="Les données collectées (vos réponses aux différentes questions) seront traitées de manière confidentielle et anonyme. Elles seront conservées après leur anonymisation intégrale et ne pourront être utilisées qu'à des fins scientifiques ou pédagogiques. Elles pourront éventuellement être partagées avec d'autres chercheurs ou enseignants, mais toujours dans ce cadre strictement de recherche ou d'enseignement.",
            )
        )
        batch_op.add_column(
            sa.Column(
                "consent_rights",
                sa.String,
                nullable=False,
                server_default="Votre participation à cette étude est volontaire. Vous pouvez à tout moment décider de ne plus participer à l'étude sans avoir à vous justifier. Vous pouvez également demander à ce que vos données soient supprimées à tout moment. Si vous avez des questions ou des préoccupations concernant cette étude, vous pouvez contacter le responsable de l'étude, Serge Bibauw, à l'adresse suivante :",
            )
        )
        batch_op.add_column(
            sa.Column(
                "consent_study_data", sa.String, nullable=False, server_default=""
            )
        )

    with op.batch_alter_table("studies") as batch_op:
        batch_op.alter_column("nb_session", server_default=None)
        batch_op.alter_column("consent_participation", server_default=None)
        batch_op.alter_column("consent_privacy", server_default=None)
        batch_op.alter_column("consent_rights", server_default=None)
        batch_op.alter_column("consent_study_data", server_default=None)

    op.drop_table("study_surveys")
    op.drop_table("survey_group_questions")
    op.drop_table("survey_groups")
    op.drop_table("survey_questions")
    op.drop_table("survey_response_info")  ## DATA LOSS
    op.drop_table("survey_responses")  ## DATA LOSS
    op.drop_table("survey_survey_groups")
    op.drop_table("survey_surveys")
    op.drop_table("test_typing")
    op.drop_table("test_typing_entry")  ## DATA LOSS

    # Auto-generated tables:
    #   study_tests
    #   test_entries
    #   test_entries_task
    #   test_entries_task_gapfill
    #   test_entries_task_qcm
    #   test_entries_typing
    #   test_task_group_questions
    #   test_task_groups
    #   test_task_questions
    #   test_task_questions_qcm
    #   test_task_task_groups
    #   test_tasks
    #   tests


def downgrade() -> None:
    with op.batch_alter_table("studies") as batch_op:
        batch_op.add_column(
            sa.Column(
                "chat_duration", sa.Integer, nullable=False, server_default="3600"
            )
        )
        batch_op.drop_column("nb_session")
        batch_op.drop_column("consent_participation")
        batch_op.drop_column("consent_privacy")
        batch_op.drop_column("consent_rights")
        batch_op.drop_column("consent_study_data")

    op.alter_column("studies", "chat_duration", server_default=None)

    op.drop_table("study_tests")
    op.drop_table("test_entries")  # DATA LOSS
    op.drop_table("test_entries_task")  # DATA LOSS
    op.drop_table("test_entries_task_gapfill")  # DATA LOSS
    op.drop_table("test_entries_task_qcm")  # DATA LOSS
    op.drop_table("test_entries_typing")  # DATA LOSS
    op.drop_table("test_task_group_questions")
    op.drop_table("test_task_groups")
    op.drop_table("test_task_questions")
    op.drop_table("test_task_questions_qcm")
    op.drop_table("test_task_task_groups")
    op.drop_table("test_tasks")
    op.drop_table("tests")

    ## Auto-generated tables:
    #   survey_group_questions
    #   survey_groups
    #   survey_questions
    #   survey_response_info
    #   survey_responses
    #   survey_survey_groups
    #   survey_surveys
    #   test_typing
    #   test_typing_entry

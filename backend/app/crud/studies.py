from typing import Optional
from sqlalchemy.orm import Session

import models
import schemas
import crud
from io import StringIO
import csv
from fastapi.responses import StreamingResponse
from utils import extract_text_between_angle_bracket


def create_study(db: Session, study: schemas.StudyCreate) -> models.Study:
    db_study = models.Study(
        **study.model_dump(exclude_unset=True, exclude={"user_ids", "test_ids"})
    )

    if study.model_fields_set & {"user_ids", "test_ids"}:
        if db_study:
            if "user_ids" in study.model_fields_set:
                db_study.users = (
                    db.query(models.User)
                    .filter(models.User.id.in_(study.user_ids))
                    .all()
                )
            if "test_ids" in study.model_fields_set:
                db_study.tests = (
                    db.query(models.Test)
                    .filter(models.Test.id.in_(study.test_ids))
                    .all()
                )

    db.add(db_study)
    db.commit()
    db.refresh(db_study)

    return db_study


def get_study(db: Session, study_id: int) -> Optional[models.Study]:
    return db.query(models.Study).filter(models.Study.id == study_id).first()


def get_studies(db: Session, skip: int = 0) -> list[models.Study]:
    return db.query(models.Study).offset(skip).all()


def update_study(db: Session, study: schemas.StudyCreate, study_id: int) -> None:
    db.query(models.Study).filter(models.Study.id == study_id).update(
        {**study.model_dump(exclude_unset=True, exclude={"user_ids", "test_ids"})}
    )

    if study.model_fields_set & {"user_ids", "test_ids"}:
        if (
            study_obj := db.query(models.Study)
            .filter(models.Study.id == study_id)
            .first()
        ):
            if "user_ids" in study.model_fields_set:
                study_obj.users = (
                    db.query(models.User)
                    .filter(models.User.id.in_(study.user_ids))
                    .all()
                )
            if "test_ids" in study.model_fields_set:
                study_obj.tests = (
                    db.query(models.Test)
                    .filter(models.Test.id.in_(study.test_ids))
                    .all()
                )

    db.commit()


def delete_study(db: Session, study_id: int) -> None:
    db.query(models.Study).filter(models.Study.id == study_id).delete()
    db.commit()


def download_study(db: Session, study_id: int):

    output = StringIO()
    writer = csv.writer(output)

    header = [
        "study",
        "test",
        "group",
        "item_id",
        "user id",
        "item type",
        "response",
        "correct",
        "response time",
    ]
    writer.writerow(header)

    # TODO filter on study_id
    # db_entries = db.query(models.TestEntry).filter(models.TestEntry.study_id == study_id).all()
    db_entries = db.query(models.TestEntry).all()

    for entry in db_entries:
        if entry.entry_task is None:
            continue

        test_id = entry.test_id
        test = crud.get_test(db, test_id).title
        group_id = entry.entry_task.test_group_id
        group = crud.get_group(db, group_id).title
        item = entry.entry_task.test_question_id
        user_id = entry.user_id
        response_time = entry.entry_task.response_time

        if entry.entry_task.entry_task_qcm:
            selected_id = entry.entry_task.entry_task_qcm.selected_id
            correct_id = entry.entry_task.test_question.question_qcm.correct
            correct_answer = selected_id == correct_id

            item_type = "qcm"
            row = [
                study_id,
                test,
                group,
                item,
                user_id,
                item_type,
                selected_id,
                correct_answer,
                response_time,
            ]
            writer.writerow(row)

        if entry.entry_task.entry_task_gapfill:
            answer = entry.entry_task.entry_task_gapfill.text
            correct = extract_text_between_angle_bracket(
                entry.entry_task.test_question.question
            )
            correct_answer = answer == correct

            item_type = "gapfill"
            row = [
                study_id,
                test,
                group,
                item,
                user_id,
                item_type,
                answer,
                correct_answer,
                response_time,
            ]
            writer.writerow(row)

    output.seek(0)

    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={study_id}-surveys.csv"},
    )

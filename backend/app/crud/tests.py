from sqlalchemy.orm import Session

import models
import schemas


def create_test(db: Session, test: schemas.TestCreate) -> models.Test:
    db_test = models.Test(**test.model_dump())
    db.add(db_test)
    db.commit()
    db.refresh(db_test)
    return db_test


def get_tests(db: Session, skip: int = 0) -> list[models.Test]:
    return db.query(models.Test).offset(skip).all()


def get_test(db: Session, test_id: int) -> models.Test:
    return db.query(models.Test).filter(models.Test.id == test_id).first()


def delete_test(db: Session, test_id: int) -> None:
    db.query(models.Test).filter(models.Test.id == test_id).delete()
    db.commit()


def add_group_to_test_task(db: Session, test: models.Test, group: models.TestTaskGroup):
    test.groups.append(group)
    db.commit()
    db.refresh(test)


def remove_group_from_test_task(
    db: Session, testTask: models.TestTask, group: models.TestTaskGroup
):
    testTask.groups.remove(group)
    db.commit()
    db.refresh(testTask)


def create_group(
    db: Session, group: schemas.TestTaskGroupCreate
) -> models.TestTaskGroup:
    db_group = models.TestTaskGroup(**group.model_dump())
    db.add(db_group)
    db.commit()
    db.refresh(db_group)
    return db_group


def get_group(db: Session, group_id: int) -> models.TestTaskGroup:
    return (
        db.query(models.TestTaskGroup)
        .filter(models.TestTaskGroup.id == group_id)
        .first()
    )


def delete_group(db: Session, group_id: int) -> None:
    db.query(models.TestTaskGroup).filter(models.TestTaskGroup.id == group_id).delete()
    db.commit()


def add_question_to_group(
    db: Session, group: models.TestTaskGroup, question: models.TestTaskQuestion
):
    group.questions.append(question)
    db.commit()
    db.refresh(group)


def remove_question_from_group(
    db: Session, group: models.TestTaskGroup, question: models.TestTaskQuestion
):
    group.questions.remove(question)
    db.commit()
    db.refresh(group)


def create_question(db: Session, question: schemas.TestTaskQuestionCreate):
    db_question = models.TestTaskQuestion(**question.model_dump())
    db.add(db_question)
    db.commit()
    db.refresh(db_question)
    return db_question


def get_question(db: Session, question_id: int):
    return (
        db.query(models.TestTaskQuestion)
        .filter(models.TestTaskQuestion.id == question_id)
        .first()
    )


def delete_question(db: Session, question_id: int):
    db.query(models.TestTaskQuestion).filter(
        models.TestTaskQuestion.id == question_id
    ).delete()
    db.commit()
    return None


def create_test_task_entry(db: Session, entry: schemas.TestTaskEntryCreate):
    db_entry = models.TestTaskEntry(**entry.model_dump())
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry

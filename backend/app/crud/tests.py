from sqlalchemy.orm import Session

from utils import extract_text_between_angle_bracket
import models
import schemas


def create_test(db: Session, test: schemas.TestCreate) -> models.Test:
    db_test = models.Test(**test.model_dump(exclude_unset=True, exclude={"test_task"}))

    if test.test_task:
        db_test.test_task = models.TestTask(
            groups=db.query(models.TestTaskGroup)
            .filter(models.TestTaskGroup.id.in_(test.test_task.groups))
            .all(),
        )

    db.add(db_test)
    db.commit()
    db.refresh(db_test)
    return db_test


def update_test(db: Session, test: schemas.TestCreate, test_id: int) -> None:
    db.query(models.Test).filter(models.Test.id == test_id).update(
        {**test.model_dump(exclude_unset=True, exclude={"test_typing", "test_task"})}
    )

    if test.test_typing:
        db.query(models.TestTyping).filter(models.TestTyping.test_id == test_id).update(
            {**test.test_typing.model_dump(exclude_unset=True)}
        )
    else:
        db.query(models.TestTyping).filter(
            models.TestTyping.test_id == test_id
        ).delete()

    if test.test_task:

        test_task = (
            db.query(models.TestTask).filter(models.TestTask.test_id == test_id).first()
        )

        if test_task:
            groups = (
                db.query(models.TestTaskGroup)
                .filter(models.TestTaskGroup.id.in_(test.test_task.groups))
                .all()
            )

            test_task.groups = groups
    else:
        db.query(models.TestTask).filter(models.TestTask.test_id == test_id).delete()

    db.commit()


def get_tests(db: Session, skip: int = 0) -> list[models.Test]:
    return db.query(models.Test).offset(skip).all()


def get_test(db: Session, test_id: int) -> models.Test | None:
    return db.query(models.Test).filter(models.Test.id == test_id).first()


def delete_test(db: Session, test_id: int) -> None:
    db.query(models.Test).filter(models.Test.id == test_id).delete()
    db.query(models.TestTask).filter(models.TestTask.test_id == test_id).delete()
    db.query(models.TestTyping).filter(models.TestTyping.test_id == test_id).delete()
    db.commit()


def add_group_to_test_task(db: Session, test: models.Test, group: models.TestTaskGroup):
    test.groups.append(group)
    db.commit()
    db.refresh(test)


def remove_group_from_test_task(
    db: Session, testTask: models.TestTask, group: models.TestTaskGroup
):
    try:
        testTask.groups.remove(group)
        db.commit()
        db.refresh(testTask)
    except ValueError:
        pass


def create_group(
    db: Session, group: schemas.TestTaskGroupCreate
) -> models.TestTaskGroup:
    db_group = models.TestTaskGroup(**group.model_dump())
    db.add(db_group)
    db.commit()
    db.refresh(db_group)
    return db_group


def get_group(db: Session, group_id: int) -> models.TestTaskGroup | None:
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
    try:
        group.questions.remove(question)
        db.commit()
        db.refresh(group)
    except ValueError:
        pass


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
    db.query(models.TestTaskQuestionQCM).filter(
        models.TestTaskQuestionQCM.question_id == question_id
    ).delete()
    db.commit()
    return None


def create_test_entry(db: Session, entry: schemas.TestEntryCreate):
    db_entry = models.TestEntry(**entry.model_dump())
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry


def get_score(db: Session, rid: str):
    db_entries = db.query(models.TestEntry).filter(models.TestEntry.rid == rid).all()

    corrects = 0
    total = 0

    for entry in db_entries:
        if entry.entry_task is None:
            continue

        total += 1

        if entry.entry_task.entry_task_qcm:
            selected_id = entry.entry_task.entry_task_qcm.selected_id
            correct_id = entry.entry_task.test_question.question_qcm.correct - 1
            corrects += selected_id == correct_id

        if entry.entry_task.entry_task_gapfill:
            answer = entry.entry_task.entry_task_gapfill.text
            correct = extract_text_between_angle_bracket(
                entry.entry_task.test_question.question
            )
            corrects += answer == correct

    if not total:
        return 0

    return corrects / total


def get_groups(db: Session):
    return db.query(models.TestTaskGroup).all()


def get_questions(db: Session):
    return db.query(models.TestTaskQuestion).all()

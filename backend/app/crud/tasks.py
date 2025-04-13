from sqlalchemy.orm import Session

import models
import schemas


def get_tasks(db: Session, skip: int = 0):
    return db.query(models.Task).offset(skip).all()


def get_task(db: Session, task_id: int):
    return db.query(models.Task).filter(models.Task.id == task_id).first()


def create_task(db: Session, task: schemas.TaskCreate) -> models.Task:
    db_task = models.Task(**task.model_dump())
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


def update_task(db: Session, task: schemas.TaskCreate, task_id: int) -> None:
    db.query(models.Task).filter(models.Task.id == task_id).update(
        {**task.model_dump(exclude_unset=True)}
    )
    db.commit()


def delete_task(db: Session, task_id: int) -> None:
    db.query(models.Task).filter(models.Task.id == task_id).delete()
    db.commit()


def create_task_status(
    db: Session, task_status: schemas.TaskStatusCreate
) -> models.TaskStatus:
    db_task_status = models.TaskStatus(**task_status.model_dump())
    db.add(db_task_status)
    db.commit()
    db.refresh(db_task_status)
    return db_task_status


def get_task_status_session(db: Session, session_id: int) -> models.TaskStatus | None:
    return (
        db.query(models.TaskStatus)
        .filter(models.TaskStatus.session_id == session_id)
        .order_by(models.TaskStatus.created_at.desc())
        .first()
    )

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

import crud
import schemas
from database import get_db
from routes.decorators import require_admin, require_tutor

taskRouter = APIRouter(prefix="/tasks", tags=["Tasks"])


@require_admin("You do not have permission to create a task.")
@taskRouter.post("", status_code=status.HTTP_201_CREATED)
def create_task(
    task: schemas.TaskCreate,
    db: Session = Depends(get_db),
):
    return crud.create_task(db, task).id


@require_admin("You do not have permission to edit a task.")
@taskRouter.put("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def update_task(
    task_id: int,
    task: schemas.TaskCreate,
    db: Session = Depends(get_db),
):
    return crud.update_task(db, task, task_id)


@require_admin("You do not have permission to delete a task.")
@taskRouter.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
):
    return crud.delete_task(db, task_id)


@taskRouter.get("", response_model=list[schemas.Task])
def get_tasks(
    skip: int = 0,
    db: Session = Depends(get_db),
):
    return crud.get_tasks(db, skip)


@require_tutor("You do not have permission to create a task status.")
@taskRouter.post("/status", status_code=status.HTTP_201_CREATED)
def create_task_status(
    task_status: schemas.TaskStatusCreate,
    db: Session = Depends(get_db),
):
    return crud.create_task_status(db, task_status).id


@taskRouter.get("/status/sessions/{session_id}", response_model=schemas.TaskStatus)
def get_task_status_session(
    session_id: int,
    db: Session = Depends(get_db),
):
    task_status = crud.get_task_status_session(db, session_id)
    if task_status is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Task status not found"
        )
    return task_status


@taskRouter.get(
    "/status/completed/students/{student_id}", response_model=list[schemas.TaskStatus]
)
def get_task_status_completed(
    student_id: int,
    db: Session = Depends(get_db),
):
    task_status = crud.get_task_status_completed(db, student_id)
    if task_status is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Task status not found"
        )
    return task_status


@taskRouter.get("/{task_id}", response_model=schemas.Task)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
):
    task = crud.get_task(db, task_id)
    if task is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Task not found"
        )
    return task

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

import crud
import schemas
from database import get_db
from routes.decorators import require_admin

testRouter = APIRouter(prefix="/tests", tags=["Tests"])


@require_admin("You do not have permission to create a test.")
@testRouter.post("", status_code=status.HTTP_201_CREATED)
def create_test(
    test: schemas.TestCreate,
    db: Session = Depends(get_db),
):
    return crud.create_test(db, test).id


@testRouter.get("")
def get_tests(
    skip: int = 0,
    db: Session = Depends(get_db),
):
    return crud.get_tests(db, skip)


@testRouter.get("/{test_id}", response_model=schemas.Test)
def get_test(
    test_id: int,
    db: Session = Depends(get_db),
):
    return crud.get_test(db, test_id)


@require_admin("You do not have permission to delete a test.")
@testRouter.delete("/{test_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_test(
    test_id: int,
    db: Session = Depends(get_db),
):
    return crud.delete_test(db, test_id)


@require_admin("You do not have permission to add a group to a task test.")
@testRouter.post("/{test_id}/groups/{group_id}", status_code=status.HTTP_201_CREATED)
def add_group_to_test(
    test_id: int,
    group_id: int,
    db: Session = Depends(get_db),
):
    test = crud.get_test(db, test_id)
    if test is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Test not found"
        )
    if test.test_task is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Test does not have a task",
        )

    group = crud.get_group(db, group_id)
    if group is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Group not found"
        )

    return crud.add_group_to_test_task(db, test.test_task, group)


@require_admin("You do not have permission to remove a group from a task test.")
@testRouter.delete(
    "/{test_id}/groups/{group_id}", status_code=status.HTTP_204_NO_CONTENT
)
def remove_group_from_test(
    test_id: int,
    group_id: int,
    db: Session = Depends(get_db),
):
    test = crud.get_test(db, test_id)
    if test is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Test not found"
        )
    if test.test_task is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Test does not have a task",
        )
    group = crud.get_group(db, group_id)
    if group is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Group not found"
        )
    return crud.remove_group_from_test_task(db, test.test_task, group)


@require_admin("You do not have permission to create a group.")
@testRouter.post("/groups", status_code=status.HTTP_201_CREATED)
def create_group(
    group: schemas.TestTaskGroupCreate,
    db: Session = Depends(get_db),
):
    return crud.create_group(db, group).id


@require_admin("You do not have permission to delete a group.")
@testRouter.delete("/groups/{group_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_group(
    group_id: int,
    db: Session = Depends(get_db),
):
    return crud.delete_group(db, group_id)


@require_admin("You do not have permission to add a question to a group.")
@testRouter.post(
    "/groups/{group_id}/questions/{question_id}", status_code=status.HTTP_201_CREATED
)
def add_question_to_group(
    group_id: int,
    question_id: int,
    db: Session = Depends(get_db),
):
    group = crud.get_group(db, group_id)
    if group is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Group not found"
        )
    question = crud.get_question(db, question_id)
    if question is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Question not found"
        )
    return crud.add_question_to_group(db, group, question)


@require_admin("You do not have permission to remove a question from a group.")
@testRouter.delete(
    "/groups/{group_id}/questions/{question_id}", status_code=status.HTTP_204_NO_CONTENT
)
def remove_question_from_group(
    group_id: int,
    question_id: int,
    db: Session = Depends(get_db),
):
    group = crud.get_group(db, group_id)
    if group is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Group not found"
        )
    question = crud.get_question(db, question_id)
    if question is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Question not found"
        )
    return crud.remove_question_from_group(db, group, question)


@require_admin("You do not have permission to create a question.")
@testRouter.post("/questions", status_code=status.HTTP_201_CREATED)
def create_question(
    question: schemas.TestTaskQuestionCreate,
    db: Session = Depends(get_db),
):
    return crud.create_question(db, question).id


@require_admin("You do not have permission to delete a question.")
@testRouter.delete("/questions/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_question(
    question_id: int,
    db: Session = Depends(get_db),
):
    return crud.delete_question(db, question_id)


@testRouter.post("/entries", status_code=status.HTTP_201_CREATED)
def create_entry(
    entry: schemas.TestTaskEntryCreate,
    db: Session = Depends(get_db),
):
    return crud.create_test_task_entry(db, entry).id

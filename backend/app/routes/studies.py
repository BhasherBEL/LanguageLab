from fastapi import APIRouter, Depends, HTTPException, status

import crud
import schemas
from database import get_db
from models import Session
from routes.decorators import require_admin


studiesRouter = APIRouter(prefix="/studies", tags=["Studies"])


@require_admin("You do not have permission to create a study.")
@studiesRouter.post("", status_code=status.HTTP_201_CREATED)
def create_study(
    study: schemas.StudyCreate,
    db: Session = Depends(get_db),
):
    return crud.create_study(db, study).id


@studiesRouter.get("", response_model=list[schemas.Study])
def get_studies(
    skip: int = 0,
    db: Session = Depends(get_db),
):
    return crud.get_studies(db, skip)


@studiesRouter.get("/{study_id}", response_model=schemas.Study)
def get_study(
    study_id: int,
    db: Session = Depends(get_db),
):
    study = crud.get_study(db, study_id)

    if study is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Study not found"
        )

    return study


@require_admin("You do not have permission to patch a study.")
@studiesRouter.patch("/{study_id}", status_code=status.HTTP_204_NO_CONTENT)
def update_study(
    study_id: int,
    study: schemas.StudyCreate,
    db: Session = Depends(get_db),
):
    return crud.update_study(db, study, study_id)


@require_admin("You do not have permission to delete a study.")
@studiesRouter.delete("/{study_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_study(
    study_id: int,
    db: Session = Depends(get_db),
):
    return crud.delete_study(db, study_id)


@require_admin("You do not have permission to download this study.")
@studiesRouter.get("/{study_id}/download/surveys")
def download_study(
    study_id: int,
    db: Session = Depends(get_db),
):
    study = crud.get_study(db, study_id)
    if study is None:
        raise HTTPException(status_code=404, detail="Study not found")
    return crud.download_study(db, study_id)


@require_admin("You do not have permission to download this study.")
@studiesRouter.get("/{study_id}/download/surveys-wide")
def download_study_wide(
    study_id: int,
    db: Session = Depends(get_db),
):
    study = crud.get_study(db, study_id)
    if study is None:
        raise HTTPException(status_code=404, detail="Study not found")
    return crud.download_study_wide(db, study_id)


@studiesRouter.post("/{study_id}/info", status_code=status.HTTP_201_CREATED)
def create_study_info(
    study_id: int,
    study_info: schemas.StudyInfoCreate,
    db: Session = Depends(get_db),
):
    return crud.create_study_info(db, study_id, study_info)


@studiesRouter.post("/{study_id}/users/{user_id}", status_code=status.HTTP_201_CREATED)
def add_user_to_study(
    study_id: int,
    user_id: int,
    current_user: schemas.User,
    db: Session = Depends(get_db),
):
    if current_user.id != user_id and current_user.type != schemas.UserType.ADMIN:
        raise HTTPException(
            status_code=403,
            detail="You do not have permission to add a user to this study.",
        )

    study = crud.get_study(db, study_id)
    if study is None:
        raise HTTPException(status_code=404, detail="Study not found")

    user = crud.get_user(db, user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    crud.add_user_to_study(db, study, user)

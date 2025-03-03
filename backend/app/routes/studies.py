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

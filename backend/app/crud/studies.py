from typing import Optional
from sqlalchemy.orm import Session

import models
import schemas


def create_study(db: Session, study: schemas.StudyCreate) -> models.Study:
    db_study = models.Study(**study.model_dump())
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
        {**study.model_dump(exclude_unset=True)}
    )
    db.commit()


def delete_study(db: Session, study_id: int) -> None:
    db.query(models.Study).filter(models.Study.id == study_id).delete()
    db.commit()

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
        {**study.model_dump(exclude_unset=True, exclude={"user_ids", "test_ids"})}
    )

    print(study.model_fields_set)

    if study.model_fields_set & {"user_ids", "test_ids"}:
        if (
            study_obj := db.query(models.Study)
            .filter(models.Study.id == study_id)
            .first()
        ):
            if "user_ids" in study.model_fields_set:
                print(study_obj.users, study.user_ids)
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

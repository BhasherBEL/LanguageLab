from pydantic import BaseModel, NaiveDatetime

from schemas.users import User
from schemas.tests import Test


class StudyCreate(BaseModel):
    title: str
    description: str
    start_date: NaiveDatetime
    end_date: NaiveDatetime
    week_duration: int = 8
    consent_participation: str
    consent_privacy: str
    consent_rights: str
    consent_study_data: str

    users: list[User]
    tests: list[Test]


class Study(StudyCreate):
    id: int

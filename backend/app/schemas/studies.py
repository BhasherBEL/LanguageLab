from pydantic import BaseModel, NaiveDatetime

from schemas.users import User
from schemas.tests import Test


class StudyCreate(BaseModel):
    title: str
    description: str
    start_date: NaiveDatetime
    end_date: NaiveDatetime
    nb_session: int = 8
    consent_participation: str
    consent_privacy: str
    consent_rights: str
    study_data_organisation: str
    study_data_address: str
    study_data_contact: str
    study_data_email: str

    user_ids: list[int] = []
    test_ids: list[int] = []


class Study(BaseModel):
    id: int
    title: str
    description: str
    start_date: NaiveDatetime
    end_date: NaiveDatetime
    nb_session: int = 8
    consent_participation: str
    consent_privacy: str
    consent_rights: str
    study_data_organisation: str
    study_data_address: str
    study_data_contact: str
    study_data_email: str

    users: list[User] = []
    tests: list[Test] = []

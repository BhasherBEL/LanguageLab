from pydantic import BaseModel, NaiveDatetime, model_validator

from models import UserType


class User(BaseModel):
    id: int
    email: str
    nickname: str
    type: int
    bio: str | None
    is_active: bool
    ui_language: str | None
    home_language: str | None
    target_language: str | None
    birthdate: NaiveDatetime | None
    gender: str | None = None
    calcom_link: str | None
    last_survey: NaiveDatetime | None = None
    availabilities: list[dict] | None = []
    tutor_list: list[str] | None = []
    my_tutor: str | None = None
    my_slots: list[dict] | None = []
    studies_id: list[int] = []
    max_learners: int | None = 10
    current_learners: int | None = None
    available_slots: int | None = None
    is_available: bool | None = None

    @model_validator(mode="before")
    @classmethod
    def add_studies_id(cls, data):
        if hasattr(data, "__dict__"):
            data.studies_id = []
            if hasattr(data, "studies") and data.studies:
                data.studies_id = [study.id for study in data.studies]
        return data

    class Config:
        from_attributes = True

    def to_dict(self):
        return {
            "id": self.id,
            "email": self.email,
            "nickname": self.nickname,
            "type": self.type,
            "availability": self.availability,
            "is_active": self.is_active,
            "ui_language": self.ui_language,
            "home_language": self.home_language,
            "target_language": self.target_language,
            "birthdate": self.birthdate.isoformat() if self.birthdate else None,
            "studies_id": self.studies_id,
        }


class UserCreate(BaseModel):
    email: str
    nickname: str | None = None
    password: str
    type: int = UserType.STUDENT.value
    bio: str | None = None
    is_active: bool = True
    ui_language: str | None = None
    home_language: str | None = None
    target_language: str | None = None
    birthdate: NaiveDatetime | None = None
    gender: str | None = None
    calcom_link: str | None = None
    last_survey: NaiveDatetime | None = None
    availabilities: list[dict] | None = []
    tutor_list: list[str] | None = []
    my_tutor: str | None = None
    my_slots: list[dict] | None = []


class UserUpdate(BaseModel):
    email: str | None = None
    nickname: str | None = None
    password: str | None = None
    type: int | None = None
    bio: str | None = None
    is_active: bool | None = None
    ui_language: str | None = None
    home_language: str | None = None
    target_language: str | None = None
    birthdate: NaiveDatetime | None = None
    gender: str | None = None
    calcom_link: str | None = None
    last_survey: NaiveDatetime | None = None
    availabilities: list[dict] | None = []
    tutor_list: list[str] | None = []
    my_tutor: str | None = None
    my_slots: list[dict] | None = None
    max_learners: int | None = None

    class Config:
        from_attributes = True

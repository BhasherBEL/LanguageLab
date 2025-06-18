from pydantic import BaseModel, NaiveDatetime, model_validator
from typing import Optional

from sqlalchemy import lambda_stmt

from models import UserType


class HumanUser(BaseModel):
    user_id: int
    email: str
    password: str | None = None
    type: int
    bio: str | None = None
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

    class Config:
        from_attributes = True

    def to_dict(self):
        return {
            "user_id": self.user_id,
            "email": self.email,
            "password": self.password,
            "type": self.type,
            "bio": self.bio,
            "ui_language": self.ui_language,
            "home_language": self.home_language,
            "target_language": self.target_language,
            "birthdate": self.birthdate,
            "gender": self.gender,
            "calcom_link": self.calcom_link,
            "last_survey": self.last_survey,
            "availabilities": self.availabilities,
            "tutor_list": self.tutor_list,
            "my_tutor": self.my_tutor,
            "my_slots": self.my_slots,
        }


class AgentUser(BaseModel):
    user_id: int
    model: str
    system_prompt: str
    is_in_pool: bool = False

    class Config:
        from_attributes = True

    def to_dict(self):
        return {
            "user_id": self.user_id,
            "model": self.model,
            "system_prompt": self.system_prompt,
            "is_in_pool": self.is_in_pool,
        }


class User(BaseModel):
    id: int
    nickname: str
    is_active: bool
    human_user: Optional[HumanUser] = None
    agent_user: Optional[AgentUser] = None
    studies_id: list[int] = []

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
            "nickname": self.nickname,
            "is_active": self.is_active,
            "studies_id": self.studies_id,
            "human_user": self.human_user.to_dict() if self.human_user else None,
            "agent_user": self.agent_user.to_dict() if self.agent_user else None,
        }


class HumanUserCreate(BaseModel):
    email: str
    password: str
    type: int = UserType.STUDENT.value
    bio: str | None = None
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


class AgentUserCreate(BaseModel):
    model: str
    system_prompt: str
    is_in_pool: bool = False


class UserCreate(BaseModel):
    nickname: str | None = None
    is_active: bool = True
    human_user: HumanUserCreate | None = None
    agent_user: AgentUserCreate | None = None

    @model_validator(mode="after")
    def check_user_type(self):
        if self.human_user is None and self.agent_user is None:
            raise ValueError("Either human_user or agent_user must be provided")
        if self.human_user is not None and self.agent_user is not None:
            raise ValueError(
                "Human_user and agent_user cannot be provided at the same time"
            )
        return self


class HumanUserUpdate(BaseModel):
    email: str | None = None
    password: str | None = None
    type: int | None = None
    bio: str | None = None
    ui_language: str | None = None
    home_language: str | None = None
    target_language: str | None = None
    birthdate: NaiveDatetime | None = None
    gender: str | None = None
    calcom_link: str | None = None
    last_survey: NaiveDatetime | None = None
    availabilities: list[dict] | None = None
    tutor_list: list[str] | None = None
    my_tutor: str | None = None
    my_slots: list[dict] | None = None


class AgentUserUpdate(BaseModel):
    model: str | None = None
    system_prompt: str | None = None
    is_in_pool: bool | None = None


class UserUpdate(BaseModel):
    nickname: str | None = None
    is_active: bool | None = None
    human_user: HumanUserUpdate | None = None
    agent_user: AgentUserUpdate | None = None

    @model_validator(mode="after")
    def check_user_type(self):
        if self.human_user is None and self.agent_user is None:
            raise ValueError("Either human_user or agent_user must be provided")
        if self.human_user is not None and self.agent_user is not None:
            raise ValueError(
                "Human_user and agent_user cannot be provided at the same time"
            )
        return self

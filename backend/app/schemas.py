from pydantic import BaseModel

from models import UserType
import datetime


class User(BaseModel):
    id: int
    email: str
    nickname: str
    type: int
    availability: int
    is_active: bool
    ui_language: str | None
    home_language: str | None
    target_language: str | None
    birthdate: datetime.datetime | None
    gender: str | None = None
    calcom_link: str | None

    class Config:
        from_attributes = True


class UserCreate(BaseModel):
    email: str
    nickname: str | None = None
    password: str
    type: int = UserType.STUDENT.value
    availability: int = 0
    is_active: bool = True
    ui_language: str | None = None
    home_language: str | None = None
    target_language: str | None = None
    birthdate: datetime.datetime | None = None
    gender: str | None = None
    calcom_link: str | None = None


class UserUpdate(BaseModel):
    email: str | None = None
    nickname: str | None = None
    password: str | None = None
    type: int | None = None
    availability: int | None = None
    is_active: bool | None = None
    ui_language: str | None = None
    home_language: str | None = None
    target_language: str | None = None
    birthdate: datetime.datetime | None = None
    gender: str | None = None
    calcom_link: str | None = None

    class Config:
        from_attributes = True


class ContactCreate(BaseModel):
    user_id: int

    class Config:
        from_attributes = True


class Session(BaseModel):
    id: int
    created_at: datetime.datetime
    is_active: bool
    users: list[User]
    start_time: datetime.datetime
    end_time: datetime.datetime
    language: str

    class Config:
        from_attributes = True


class SessionUpdate(BaseModel):
    is_active: bool | None = None
    language: str | None = None

    class Config:
        from_attributes = True


class Message(BaseModel):
    id: int
    content: str
    user_id: int
    session_id: int
    created_at: datetime.datetime

    class Config:
        from_attributes = True

    def to_dict(self):
        return {
            "id": self.id,
            "content": self.content,
            "user_id": self.user_id,
            "session_id": self.session_id,
            "created_at": self.created_at.isoformat(),
        }


class MessageMetadataCreate(BaseModel):
    message: str
    date: int

    class Config:
        from_attributes = True


class MessageCreate(BaseModel):
    content: str
    metadata: list[MessageMetadataCreate]

    class Config:
        from_attributes = True


class TestTypingEntryCreate(BaseModel):
    exerciceId: int
    position: int
    downtime: int
    uptime: int
    keyCode: int
    keyValue: str


class TestTypingCreate(BaseModel):
    entries: list[TestTypingEntryCreate]


class TestVocabularyCreate(BaseModel):
    content: str


class CalComWebhook(BaseModel):
    triggerEvent: str
    createdAt: datetime.datetime
    payload: dict


class SurveyOption(BaseModel):
    id: int
    question_id: int
    correct: bool
    type: str
    value: str


class SurveyOptionCreate(BaseModel):
    correct: bool
    type: str
    value: str


class SurveyQuestionCreate(BaseModel):
    title: str
    question_type: str
    question_value: str


class SurveyQuestion(BaseModel):
    id: int
    group_id: int
    title: str
    question_type: str
    question_value: str
    options: list[SurveyOption]


class SurveyGroupCreate(BaseModel):
    title: str


class SurveyGroup(BaseModel):
    id: int
    survey_id: int
    title: str
    questions: list[SurveyQuestion]


class SurveyCreate(BaseModel):
    title: str


class Survey(BaseModel):
    id: int
    title: str
    groups: list[SurveyGroup]


class SurveyResponseCreate(BaseModel):
    uuid: str
    question_id: int
    option_id: int
    response_time: float

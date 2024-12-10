from pydantic import BaseModel, NaiveDatetime

from models import UserType


class LoginData(BaseModel):
    email: str
    password: str


class RegisterData(BaseModel):
    email: str
    password: str
    nickname: str
    is_tutor: bool


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
    birthdate: NaiveDatetime | None
    gender: str | None = None
    calcom_link: str | None
    study_id: int | None = None
    last_survey: NaiveDatetime | None = None

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
    birthdate: NaiveDatetime | None = None
    gender: str | None = None
    calcom_link: str | None = None
    study_id: int | None = None
    last_survey: NaiveDatetime | None = None


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
    birthdate: NaiveDatetime | None = None
    gender: str | None = None
    calcom_link: str | None = None
    study_id: int | None = None
    last_survey: NaiveDatetime | None = None

    class Config:
        from_attributes = True


class ContactCreate(BaseModel):
    user_id: int

    class Config:
        from_attributes = True


class UserSurveyWeeklyCreate(BaseModel):
    q1: float | None = None
    q2: float | None = None
    q3: float | None = None
    q4: float | None = None


class Session(BaseModel):
    id: int
    created_at: NaiveDatetime
    is_active: bool
    users: list[User]
    start_time: NaiveDatetime
    end_time: NaiveDatetime
    language: str
    length: int | None = None

    class Config:
        from_attributes = True


class SessionUpdate(BaseModel):
    is_active: bool | None = None
    language: str | None = None

    class Config:
        from_attributes = True


class SessionSatisfyCreate(BaseModel):
    usefullness: int
    easiness: int
    remarks: str | None = None


class SessionBookingCreate(BaseModel):
    start_time: NaiveDatetime
    end_time: NaiveDatetime


class MessageFeedback(BaseModel):
    id: int
    message_id: int
    start: int
    end: int
    content: str
    date: NaiveDatetime

    class Config:
        from_attributes = True

    def to_dict(self):
        return {
            "id": self.id,
            "message_id": self.message_id,
            "start": self.start,
            "end": self.end,
            "content": self.content,
            "date": self.date.isoformat(),
        }


class MessageFeedbackCreate(BaseModel):
    start: int
    end: int
    content: str | None = None


class Message(BaseModel):
    id: int
    message_id: str
    content: str
    user_id: int
    session_id: int
    created_at: NaiveDatetime
    reply_to_message_id: int | None = None
    feedbacks: list[MessageFeedback]

    class Config:
        from_attributes = True

    def to_dict(self):
        return {
            "id": self.id,
            "message_id": self.message_id,
            "content": self.content,
            "user_id": self.user_id,
            "session_id": self.session_id,
            "created_at": self.created_at.isoformat(),
            "reply_to_message_id": self.reply_to_message_id,
            "feedbacks": [feedback.to_dict() for feedback in self.feedbacks],
        }


class MessageMetadataCreate(BaseModel):
    message: str
    date: int

    class Config:
        from_attributes = True


class MessageCreate(BaseModel):
    message_id: str | None = None
    content: str
    reply_to_message_id: int | None = None
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
    createdAt: NaiveDatetime
    payload: dict


class SurveyQuestionCreate(BaseModel):
    id: int | None = None
    question: str
    correct: int
    option1: str | None = None
    option2: str | None = None
    option3: str | None = None
    option4: str | None = None
    option5: str | None = None
    option6: str | None = None
    option7: str | None = None
    option8: str | None = None


class SurveyQuestion(BaseModel):
    id: int
    question: str
    correct: int
    option1: str | None = None
    option2: str | None = None
    option3: str | None = None
    option4: str | None = None
    option5: str | None = None
    option6: str | None = None
    option7: str | None = None
    option8: str | None = None


class SurveyGroupCreate(BaseModel):
    id: int | None = None
    title: str
    demo: bool
    questions: list[SurveyQuestionCreate] = []


class SurveyGroup(BaseModel):
    id: int
    title: str
    demo: bool
    questions: list[SurveyQuestion]


class SurveyGroupAddQuestion(BaseModel):
    question_id: int


class SurveyCreate(BaseModel):
    id: int | None = None
    title: str
    groups: list[SurveyGroupCreate] = []


class Survey(BaseModel):
    id: int
    title: str
    groups: list[SurveyGroup]


class SurveySurveyAddGroup(BaseModel):
    group_id: int


class SurveyResponseCreate(BaseModel):
    code: str
    sid: str
    uid: int | None = None
    survey_id: int
    group_id: int
    question_id: int
    selected_id: int
    response_time: float
    text: str | None = None


class SurveyResponse(BaseModel):
    id: int
    code: str
    sid: str
    uid: int | None = None
    created_at: NaiveDatetime
    survey_id: int
    group_id: int
    question_id: int
    selected_id: int
    response_time: float
    text: str | None = None


class SurveyResponseInfoCreate(BaseModel):
    sid: str
    birthyear: int
    gender: str
    primary_language: str
    education: str


class SurveyResponseInfo(BaseModel):
    id: int
    sid: str
    birthyear: int
    gender: str
    primary_language: str
    education: str


class Study(BaseModel):
    id: int
    title: str
    description: str
    start_date: NaiveDatetime
    end_date: NaiveDatetime
    chat_duration: int


class StudyCreate(BaseModel):
    title: str
    description: str
    start_date: NaiveDatetime
    end_date: NaiveDatetime
    chat_duration: int = 30 * 60

from sqlalchemy import (
    Column,
    Float,
    Integer,
    String,
    Boolean,
    ForeignKey,
    DateTime,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship
from enum import Enum

from database import Base
import datetime
from utils import datetime_aware
from sqlalchemy.dialects.postgresql import JSON


class UserType(Enum):
    ADMIN = 0
    TUTOR = 1
    STUDENT = 2


class Contact(Base):
    __tablename__ = "contacts"

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True, index=True)
    contact_id = Column(Integer, ForeignKey("users.id"), primary_key=True, index=True)

    UniqueConstraint("user_id", "contact_id", name="unique_contact")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    nickname = Column(String, index=True)
    password = Column(String)
    type = Column(Integer, default=UserType.STUDENT.value)
    is_active = Column(Boolean, default=True)
    bio = Column(String, default="")
    ui_language = Column(String, default="fr")
    home_language = Column(String, default="en")
    target_language = Column(String, default="fr")
    birthdate = Column(DateTime, default=None)
    gender = Column(String, default=None)
    calcom_link = Column(String, default="")
    last_survey = Column(DateTime, default=None)
    availabilities = Column(JSON, default=[])
    tutor_list = Column(JSON, default=[])
    my_tutor = Column(String, default="")
    my_slots = Column(JSON, default=[])

    sessions = relationship(
        "Session", secondary="user_sessions", back_populates="users"
    )

    contacts = relationship(
        "User",
        secondary="contacts",
        primaryjoin=(id == Contact.user_id),
        secondaryjoin=(id == Contact.contact_id),
        back_populates="contacts",
    )

    contact_of = relationship(
        "User",
        secondary="contacts",
        primaryjoin=(id == Contact.contact_id),
        secondaryjoin=(id == Contact.user_id),
        back_populates="contacts",
    )

    studies = relationship("Study", secondary="study_users", back_populates="users")


class UserSurveyWeekly(Base):
    __tablename__ = "users_survey_weekly"

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime_aware)
    user_id = Column(Integer, ForeignKey("users.id"))
    q1 = Column(Float)
    q2 = Column(Float)
    q3 = Column(Float)
    q4 = Column(Float)


class Session(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime_aware)
    is_active = Column(Boolean, default=True)
    start_time = Column(DateTime, default=datetime_aware)
    end_time = Column(
        DateTime,
        default=lambda: datetime_aware() + datetime.timedelta(hours=12),
    )
    language = Column(String, default="fr")

    users = relationship("User", secondary="user_sessions", back_populates="sessions")


class SessionSatisfy(Base):
    __tablename__ = "session_satisfy"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    session_id = Column(Integer, ForeignKey("sessions.id"))
    created_at = Column(DateTime, default=datetime_aware)
    usefullness = Column(Integer)
    easiness = Column(Integer)
    remarks = Column(String)


class UserSession(Base):
    __tablename__ = "user_sessions"

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True, index=True)
    session_id = Column(String, ForeignKey("sessions.id"), primary_key=True, index=True)


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    message_id = Column(String)
    content = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"))
    session_id = Column(Integer, ForeignKey("sessions.id"))
    created_at = Column(DateTime, default=datetime_aware)
    reply_to_message_id = Column(
        Integer, ForeignKey("messages.message_id"), nullable=True
    )

    feedbacks = relationship("MessageFeedback", backref="message")
    replies = relationship(
        "Message", backref="parent_message", remote_side=[message_id]
    )

    def raw(self):
        return [
            self.id,
            self.message_id,
            self.content,
            self.user_id,
            self.session_id,
            self.reply_to_message_id,
            self.created_at,
        ]

    feedbacks = relationship("MessageFeedback", backref="message")


class MessageMetadata(Base):
    __tablename__ = "message_metadata"

    id = Column(Integer, primary_key=True, index=True)
    message_id = Column(Integer, ForeignKey("messages.id"))
    message = Column(String)
    date = Column(Integer)

    def raw(self):
        return [self.id, self.message_id, self.message, self.date]


class MessageFeedback(Base):
    __tablename__ = "message_feedbacks"

    id = Column(Integer, primary_key=True, index=True)
    message_id = Column(Integer, ForeignKey("messages.id"))
    start = Column(Integer)
    end = Column(Integer)
    content = Column(String, default="")
    date = Column(DateTime, default=datetime_aware)

    def raw(self):
        return [self.id, self.message_id, self.start, self.end, self.content, self.date]


class TestTyping(Base):
    __tablename__ = "test_typing"

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime_aware)
    code = Column(String)
    entries = relationship("TestTypingEntry", backref="typing")


class TestTypingEntry(Base):
    __tablename__ = "test_typing_entry"

    id = Column(Integer, primary_key=True, index=True)
    typing_id = Column(Integer, ForeignKey("test_typing.id"), index=True)
    exerciceId = Column(Integer)
    position = Column(Integer)
    downtime = Column(Integer)
    uptime = Column(Integer)
    keyCode = Column(Integer)
    keyValue = Column(String)


class SurveyGroupQuestion(Base):
    __tablename__ = "survey_group_questions"

    group_id = Column(Integer, ForeignKey("survey_groups.id"), primary_key=True)
    question_id = Column(Integer, ForeignKey("survey_questions.id"), primary_key=True)


class SurveyQuestion(Base):
    __tablename__ = "survey_questions"

    id = Column(Integer, primary_key=True, index=True)
    question = Column(String)
    correct = Column(Integer)
    option1 = Column(String)
    option2 = Column(String)
    option3 = Column(String)
    option4 = Column(String)
    option5 = Column(String)
    option6 = Column(String)
    option7 = Column(String)
    option8 = Column(String)


class SurveyGroup(Base):
    __tablename__ = "survey_groups"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    demo = Column(String, default=False)
    questions = relationship(
        "SurveyQuestion", secondary="survey_group_questions", backref="group"
    )


class SurveySurvey(Base):
    __tablename__ = "survey_surveys"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    groups = relationship(
        "SurveyGroup", secondary="survey_survey_groups", backref="survey"
    )
    studies = relationship("Study", secondary="study_surveys", back_populates="surveys")


class SurveySurveyGroup(Base):
    __tablename__ = "survey_survey_groups"

    survey_id = Column(Integer, ForeignKey("survey_surveys.id"), primary_key=True)
    group_id = Column(Integer, ForeignKey("survey_groups.id"), primary_key=True)


class SurveyResponse(Base):
    __tablename__ = "survey_responses"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String)
    sid = Column(String)
    uid = Column(Integer, ForeignKey("users.id"), default=None)
    created_at = Column(DateTime, default=datetime_aware)
    survey_id = Column(Integer, ForeignKey("survey_surveys.id"))
    group_id = Column(Integer, ForeignKey("survey_groups.id"))
    question_id = Column(Integer, ForeignKey("survey_questions.id"))
    selected_id = Column(Integer)
    response_time = Column(Float)
    text = Column(String)


class SurveyResponseInfo(Base):
    __tablename__ = "survey_response_info"

    id = Column(Integer, primary_key=True, index=True)
    sid = Column(String)
    birthyear = Column(Integer)
    gender = Column(String)
    primary_language = Column(String)
    other_language = Column(String)
    education = Column(String)


class Study(Base):
    __tablename__ = "studies"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(String)
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    chat_duration = Column(Integer)

    users = relationship("User", secondary="study_users", back_populates="studies")
    surveys = relationship(
        "SurveySurvey", secondary="study_surveys", back_populates="studies"
    )


class StudyUser(Base):
    __tablename__ = "study_users"

    study_id = Column(Integer, ForeignKey("studies.id"), primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)


class StudySurvey(Base):
    __tablename__ = "study_surveys"

    study_id = Column(Integer, ForeignKey("studies.id"), primary_key=True)
    survey_id = Column(Integer, ForeignKey("survey_surveys.id"), primary_key=True)

from sqlalchemy import (
    JSON,
    Column,
    Float,
    Integer,
    String,
    Boolean,
    ForeignKey,
    DateTime,
    UniqueConstraint,
)
from sqlalchemy.orm import relationship, validates
from enum import Enum

from database import Base
import datetime
from utils import datetime_aware

from models.studies import *
from models.tests import *
from models.tasks import *


class UserType(Enum):
    ADMIN = 0
    TUTOR = 1
    STUDENT = 2


class Contact(Base):
    __tablename__ = "contacts"

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True, index=True)
    contact_id = Column(Integer, ForeignKey("users.id"), primary_key=True, index=True)

    UniqueConstraint("user_id", "contact_id", name="unique_contact")


class HumanUser(Base):
    __tablename__ = "human_users"
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    type = Column(Integer, default=UserType.STUDENT.value)
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

    user = relationship(
        "User", uselist=False, back_populates="human_user", lazy="selectin"
    )


class AgentUser(Base):
    __tablename__ = "agent_users"
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True, index=True)
    model = Column(String, nullable=False)
    system_prompt = Column(String, nullable=False)
    is_in_pool = Column(Boolean, default=False)

    user = relationship(
        "User", uselist=False, back_populates="agent_user", lazy="selectin"
    )


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    nickname = Column(String, index=True)
    is_active = Column(Boolean, default=True)

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

    human_user = relationship(
        "HumanUser", uselist=False, back_populates="user", lazy="selectin"
    )

    agent_user = relationship(
        "AgentUser", uselist=False, back_populates="user", lazy="selectin"
    )

    @validates("human_user")
    def adjust_human_user(self, _, value) -> HumanUser | None:
        if value:
            if isinstance(value, dict):
                return HumanUser(**value, user_id=self.id)
            else:
                value.user_id = self.id
                return value

    @validates("agent_user")
    def adjust_agent_user(self, _, value) -> AgentUser | None:
        if value:
            if isinstance(value, dict):
                return AgentUser(**value, user_id=self.id)
            else:
                value.user_id = self.id
                return value


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

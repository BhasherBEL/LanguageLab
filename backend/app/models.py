from sqlalchemy import (
    Column,
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


class UserType(Enum):
    ADMIN = 0
    TUTOR = 1
    STUDENT = 2


class Contact(Base):
    __tablename__ = "contacts"

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True, index=True)
    contact_id = Column(Integer, ForeignKey("users.id"), primary_key=True, index=True)
    # last_message_id = Column(Integer, ForeignKey("messages.id"))

    UniqueConstraint("user_id", "contact_id", name="unique_contact")


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    nickname = Column(String, index=True)
    password = Column(String)
    type = Column(Integer, default=UserType.STUDENT.value)
    is_active = Column(Boolean, default=True)
    availability = Column(Integer, default=0)
    ui_language = Column(String, default="fr")
    home_language = Column(String, default="en")
    target_language = Column(String, default="fr")
    birthdate = Column(Integer, default=None)
    calcom_link = Column(String, default="")

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


class Session(Base):
    __tablename__ = "sessions"

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.datetime.now)
    is_active = Column(Boolean, default=True)
    start_time = Column(DateTime, default=datetime.datetime.now)
    end_time = Column(
        DateTime, default=lambda: datetime.datetime.now() + datetime.timedelta(hours=12)
    )
    language = Column(String, default="fr")

    users = relationship("User", secondary="user_sessions", back_populates="sessions")


class UserSession(Base):
    __tablename__ = "user_sessions"

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True, index=True)
    session_id = Column(String, ForeignKey("sessions.id"), primary_key=True, index=True)


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(String)
    user_id = Column(Integer, ForeignKey("users.id"))
    session_id = Column(Integer, ForeignKey("sessions.id"))
    created_at = Column(DateTime, default=datetime.datetime.now)


class MessageMetadata(Base):
    __tablename__ = "message_metadata"

    id = Column(Integer, primary_key=True, index=True)
    message_id = Column(Integer, ForeignKey("messages.id"))
    message = Column(String)
    date = Column(Integer)


class TestTyping(Base):
    __tablename__ = "test_typing"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True)
    created_at = Column(DateTime, default=datetime.datetime.now)
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


class TestVocabulary(Base):
    __tablename__ = "test_vocabulary"

    id = Column(Integer, primary_key=True, index=True)
    content = Column(String)

from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from enum import Enum

from database import Base
import datetime


class UserType(Enum):
    ADMIN = 0
    TUTOR = 1
    STUDENT = 2


class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    nickname = Column(String, index=True)
    password = Column(String)
    type = Column(Integer, default=UserType.STUDENT.value)
    is_active = Column(Boolean, default=True)

    sessions = relationship("Session", secondary="user_sessions", back_populates="users")


class Session(Base):
    __tablename__ = 'sessions'

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.datetime.now)
    is_active = Column(Boolean, default=True)
    start_time = Column(DateTime, default=datetime.datetime.now)
    end_time = Column(DateTime, default=lambda: datetime.datetime.now() + datetime.timedelta(hours=12))

    users = relationship("User", secondary="user_sessions", back_populates="sessions")


class UserSession(Base):
    __tablename__ = "user_sessions"

    user_id = Column(Integer, ForeignKey('users.id'), primary_key=True, index=True)
    session_id = Column(String, ForeignKey('sessions.id'), primary_key=True, index=True)


class Message(Base):
    __tablename__ = 'messages'

    id = Column(Integer, primary_key=True, index=True)
    content = Column(String)
    user_id = Column(Integer, ForeignKey('users.id'))
    session_id = Column(Integer, ForeignKey('sessions.id'))
    created_at = Column(DateTime, default=datetime.datetime.now)

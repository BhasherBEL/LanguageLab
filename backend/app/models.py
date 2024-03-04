from sqlalchemy import Column, Integer, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from enum import Enum

from database import Base


class UserType(Enum):
    ADMIN = 0
    TUTOR = 1
    STUDENT = 2


class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)
    type = Column(Integer, default=UserType.STUDENT.value)
    is_active = Column(Boolean, default=True)

    sessions = relationship("Session", secondary="user_sessions", back_populates="users")


class Session(Base):
    __tablename__ = 'sessions'

    id = Column(Integer, primary_key=True, index=True)
    token = Column(String, unique=True, index=True)
    is_active = Column(Boolean, default=True)

    users = relationship("User", secondary="user_sessions", back_populates="sessions")


class UserSession(Base):
    __tablename__ = "user_sessions"

    user_id = Column(Integer, ForeignKey('users.id'), primary_key=True, index=True)
    session_id = Column(String, ForeignKey('sessions.id'), primary_key=True, index=True)

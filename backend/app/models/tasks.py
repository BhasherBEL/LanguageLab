from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from utils import datetime_aware
from database import Base


class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    level = Column(String, nullable=False)
    shortTitle = Column(String, nullable=False)
    instructions = Column(String, nullable=True)
    learnerInstructions = Column(String, nullable=True)
    examples = Column(String, nullable=False)


class TaskStatus(Base):
    __tablename__ = "task_statuses"
    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String, nullable=False)
    tutor_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    session_id = Column(Integer, ForeignKey("sessions.id"), nullable=False)
    created_at = Column(DateTime, default=datetime_aware)

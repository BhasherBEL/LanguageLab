from database import Base

from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    DateTime,
)
from sqlalchemy.orm import relationship


class Study(Base):
    __tablename__ = "studies"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    description = Column(String)
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    nb_session = Column(Integer)
    consent_participation = Column(String)
    consent_privacy = Column(String)
    consent_rights = Column(String)
    study_data_organisation = Column(String)
    study_data_address = Column(String)
    study_data_contact = Column(String)
    study_data_email = Column(String)

    users = relationship("User", secondary="study_users")
    tests = relationship("Test", secondary="study_tests")


class StudyUser(Base):
    __tablename__ = "study_users"

    study_id = Column(Integer, ForeignKey("studies.id"), primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)


class StudyTest(Base):
    __tablename__ = "study_tests"

    study_id = Column(Integer, ForeignKey("studies.id"), primary_key=True)
    test_id = Column(Integer, ForeignKey("tests.id"), primary_key=True)


class StudyInfo(Base):
    __tablename__ = "study_infos"
    id = Column(Integer, primary_key=True, index=True)
    study_id = Column(Integer, ForeignKey("studies.id"))
    rid = Column(String)
    birthyear = Column(Integer)
    gender = Column(String)
    primary_language = Column(String)
    other_languages = Column(String)
    education = Column(String)

from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship, validates
from utils import datetime_aware
from database import Base


class TestTyping(Base):
    __tablename__ = "test_typings"

    test_id = Column(Integer, ForeignKey("tests.id"), primary_key=True)
    explanations = Column(String, nullable=True)
    text = Column(String, nullable=False)
    repeat = Column(Integer, nullable=False, default=1)
    duration = Column(Integer, nullable=False, default=0)

    test = relationship(
        "Test", uselist=False, back_populates="test_typing", lazy="selectin"
    )


class TestTypingEntry(Base):
    __tablename__ = "test_typing_entries"

    id = Column(Integer, primary_key=True, index=True)
    test_id = Column(Integer, ForeignKey("test_typings.test_id"), index=True)
    code = Column(String, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), default=None)
    created_at = Column(DateTime, default=datetime_aware)
    position = Column(Integer, nullable=False)
    downtime = Column(Integer, nullable=False)
    uptime = Column(Integer, nullable=False)
    key_code = Column(Integer, nullable=False)
    key_value = Column(String, nullable=False)

    test_typing = relationship("TestTyping")
    user = relationship("User")


class TestTask(Base):
    __tablename__ = "test_tasks"
    test_id = Column(Integer, ForeignKey("tests.id"), primary_key=True)

    test = relationship(
        "Test", uselist=False, back_populates="test_task", lazy="selectin"
    )
    groups = relationship(
        "TestTaskGroup",
        secondary="test_task_task_groups",
        lazy="selectin",
    )


class Test(Base):
    __tablename__ = "tests"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)

    test_typing = relationship(
        "TestTyping",
        uselist=False,
        back_populates="test",
        lazy="selectin",
    )
    test_task = relationship(
        "TestTask",
        uselist=False,
        back_populates="test",
        lazy="selectin",
    )

    @validates("test_typing")
    def adjust_test_typing(self, _, value) -> TestTyping | None:
        if value:
            return TestTyping(**value, test_id=self.id)

    @validates("test_task")
    def adjust_test_task(self, _, value) -> TestTask | None:
        if value:
            return TestTask(**value, test_id=self.id)


class TestTaskTaskGroup(Base):
    __tablename__ = "test_task_task_groups"

    test_task_id = Column(Integer, ForeignKey("test_tasks.test_id"), primary_key=True)
    group_id = Column(Integer, ForeignKey("test_task_groups.id"), primary_key=True)


class TestTaskGroup(Base):
    __tablename__ = "test_task_groups"
    id = Column(Integer, primary_key=True, index=True)

    title = Column(String, nullable=False)
    demo = Column(Boolean, default=False)
    randomize = Column(Boolean, default=True)

    questions = relationship(
        "TestTaskQuestion",
        secondary="test_task_group_questions",
        lazy="selectin",
    )


class TestTaskGroupQuestion(Base):
    __tablename__ = "test_task_group_questions"
    group_id = Column(Integer, ForeignKey("test_task_groups.id"), primary_key=True)
    question_id = Column(
        Integer, ForeignKey("test_task_questions.id"), primary_key=True
    )


class TestTaskQuestionQCM(Base):
    __tablename__ = "test_task_questions_qcm"

    question_id = Column(
        Integer, ForeignKey("test_task_questions.id"), primary_key=True
    )

    correct = Column(Integer, nullable=True)
    option1 = Column(String, nullable=True)
    option2 = Column(String, nullable=True)
    option3 = Column(String, nullable=True)
    option4 = Column(String, nullable=True)
    option5 = Column(String, nullable=True)
    option6 = Column(String, nullable=True)
    option7 = Column(String, nullable=True)
    option8 = Column(String, nullable=True)

    question = relationship("TestTaskQuestion", back_populates="question_qcm")


class TestTaskQuestion(Base):
    __tablename__ = "test_task_questions"
    id = Column(Integer, primary_key=True, index=True)
    question = Column(String, nullable=True)

    question_qcm = relationship(
        "TestTaskQuestionQCM",
        uselist=False,
        back_populates="question",
        lazy="selectin",
    )

    @validates("question_qcm")
    def adjust_question_qcm(self, _, value) -> TestTaskQuestionQCM | None:
        if value:
            return TestTaskQuestionQCM(**value, question_id=self.id)


class TestTaskEntryQCM(Base):
    __tablename__ = "test_task_entries_qcm"

    entry_id = Column(Integer, ForeignKey("test_task_entries.id"), primary_key=True)
    selected_id = Column(Integer, nullable=False)

    entry = relationship(
        "TestTaskEntry", uselist=False, back_populates="entry_qcm", lazy="selectin"
    )


class TestTaskEntryGapfill(Base):
    __tablename__ = "test_task_entries_gapfill"

    entry_id = Column(Integer, ForeignKey("test_task_entries.id"), primary_key=True)
    text = Column(String, nullable=False)

    entry = relationship(
        "TestTaskEntry", uselist=False, back_populates="entry_gapfill", lazy="selectin"
    )


class TestTaskEntry(Base):
    __tablename__ = "test_task_entries"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), default=None)
    created_at = Column(DateTime, default=datetime_aware)
    test_task_id = Column(Integer, ForeignKey("test_tasks.test_id"), index=True)
    test_group_id = Column(Integer, ForeignKey("test_task_groups.id"), index=True)
    test_question_id = Column(Integer, ForeignKey("test_task_questions.id"), index=True)
    response_time = Column(Float, nullable=False)

    entry_qcm = relationship(
        "TestTaskEntryQCM", uselist=False, back_populates="entry", lazy="selectin"
    )
    entry_gapfill = relationship(
        "TestTaskEntryGapfill", uselist=False, back_populates="entry", lazy="selectin"
    )

    @validates("entry_qcm")
    def adjust_entry_qcm(self, _, value) -> TestTaskEntryQCM | None:
        if value:
            return TestTaskEntryQCM(**value, entry_id=self.id)

    @validates("entry_gapfill")
    def adjust_entry_gapfill(self, _, value) -> TestTaskEntryGapfill | None:
        if value:
            return TestTaskEntryGapfill(**value, entry_id=self.id)

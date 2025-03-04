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
            if isinstance(value, dict):
                return TestTyping(**value, test_id=self.id)
            else:
                value.test_id = self.id
                return value

    @validates("test_task")
    def adjust_test_task(self, _, value) -> TestTask | None:
        if value:
            if isinstance(value, dict):
                return TestTask(**value, test_id=self.id)
            else:
                value.test_id = self.id
                return value


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
            if isinstance(value, dict):
                return TestTaskQuestionQCM(**value, question_id=self.id)
            else:
                value.question_id = self.id
                return value


class TestEntryTaskQCM(Base):
    __tablename__ = "test_entries_task_qcm"

    entry_id = Column(
        Integer, ForeignKey("test_entries_task.entry_id"), primary_key=True
    )
    selected_id = Column(Integer, nullable=False)

    entry_task = relationship(
        "TestEntryTask",
        uselist=False,
        back_populates="entry_task_qcm",
        lazy="selectin",
    )


class TestEntryTaskGapfill(Base):
    __tablename__ = "test_entries_task_gapfill"

    entry_id = Column(
        Integer, ForeignKey("test_entries_task.entry_id"), primary_key=True, index=True
    )
    text = Column(String, nullable=False)

    entry_task = relationship(
        "TestEntryTask",
        uselist=False,
        back_populates="entry_task_gapfill",
        lazy="selectin",
    )


class TestEntryTask(Base):
    __tablename__ = "test_entries_task"

    entry_id = Column(
        Integer, ForeignKey("test_entries.id"), primary_key=True, index=True
    )

    test_group_id = Column(Integer, ForeignKey("test_task_groups.id"), index=True)
    test_question_id = Column(Integer, ForeignKey("test_task_questions.id"), index=True)
    response_time = Column(Float, nullable=False)

    entry_task_qcm = relationship(
        "TestEntryTaskQCM",
        uselist=False,
        back_populates="entry_task",
        lazy="selectin",
    )
    entry_task_gapfill = relationship(
        "TestEntryTaskGapfill",
        uselist=False,
        back_populates="entry_task",
        lazy="selectin",
    )

    test_question = relationship("TestTaskQuestion", uselist=False, lazy="selectin")

    entry = relationship("TestEntry", uselist=False, back_populates="entry_task")

    @validates("entry_task_qcm")
    def adjust_entry_qcm(self, _, value) -> TestEntryTaskQCM | None:
        if value:
            if isinstance(value, dict):
                return TestEntryTaskQCM(**value, entry_id=self.entry_id)
            else:
                value.entry_id = self.entry_id
                return value

    @validates("entry_task_gapfill")
    def adjust_entry_gapfill(self, _, value) -> TestEntryTaskGapfill | None:
        if value:
            if isinstance(value, dict):
                return TestEntryTaskGapfill(**value, entry_id=self.entry_id)
            else:
                value.entry_id = self.entry_id
                return value


class TestEntryTyping(Base):
    __tablename__ = "test_entries_typing"

    entry_id = Column(
        Integer, ForeignKey("test_entries.id"), primary_key=True, index=True
    )

    position = Column(Integer, nullable=False)
    downtime = Column(Integer, nullable=False)
    uptime = Column(Integer, nullable=False)
    key_code = Column(Integer, nullable=False)
    key_value = Column(String, nullable=False)

    entry = relationship(
        "TestEntry", uselist=False, back_populates="entry_typing", lazy="selectin"
    )


class TestEntry(Base):
    __tablename__ = "test_entries"

    id = Column(Integer, primary_key=True, index=True)
    code = Column(String, nullable=False)
    rid = Column(String, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), default=None, nullable=True)
    test_id = Column(Integer, ForeignKey("tests.id"), nullable=False)
    created_at = Column(DateTime, default=datetime_aware)

    entry_task = relationship(
        "TestEntryTask", uselist=False, back_populates="entry", lazy="selectin"
    )
    entry_typing = relationship(
        "TestEntryTyping", uselist=False, back_populates="entry", lazy="selectin"
    )

    @validates("entry_task")
    def adjust_entry_task(self, _, value) -> TestEntryTask | None:
        if value:
            if isinstance(value, dict):
                return TestEntryTask(**value, entry_id=self.id)
            else:
                value.entry_id = self.id
                return value

    @validates("entry_typing")
    def adjust_entry_typing(self, _, value) -> TestEntryTyping | None:
        if value:
            if isinstance(value, dict):
                return TestEntryTyping(**value, entry_id=self.id)
            else:
                value.entry_id = self.id
                return value

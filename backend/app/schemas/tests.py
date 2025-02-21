from typing_extensions import Self
from pydantic import BaseModel, model_validator


class TestTypingCreate(BaseModel):
    text: str
    repeat: int | None = None
    duration: int | None = None


class TestTaskCreate(BaseModel):
    title: str


class TestCreate(BaseModel):
    # TODO remove
    id: int | None = None
    test_typing: TestTypingCreate | None = None
    test_task: TestTaskCreate | None = None

    @model_validator(mode="after")
    def check_test_type(self) -> Self:
        if self.test_typing is None and self.test_task is None:
            raise ValueError("TypingTest or TaskTest must be provided")
        if self.test_typing is not None and self.test_task is not None:
            raise ValueError(
                "TypingTest and TaskTest cannot be provided at the same time"
            )
        return self


class TestTaskGroupCreate(BaseModel):
    title: str
    demo: bool = False


class TestTaskQuestionQCMCreate(BaseModel):
    correct: int
    option1: str | None = None
    option2: str | None = None
    option3: str | None = None
    option4: str | None = None
    option5: str | None = None
    option6: str | None = None
    option7: str | None = None
    option8: str | None = None


class TestTaskQuestionCreate(BaseModel):
    # TODO remove
    id: int | None = None
    question: str | None = None

    question_qcm: TestTaskQuestionQCMCreate | None = None


class TestTaskGroupQuestionAdd(BaseModel):
    question_id: int
    group_id: int


class TestTaskGroupAdd(BaseModel):
    group_id: int
    task_id: int


class TestTaskQuestionQCM(TestTaskQuestionQCMCreate):
    pass


class TestTaskQuestion(BaseModel):
    id: int
    question: str | None = None
    question_qcm: TestTaskQuestionQCM | None = None


class TestTaskGroup(TestTaskGroupCreate):
    id: int
    questions: list[TestTaskQuestion] = []


class TestTask(TestTaskCreate):
    id: int
    groups: list[TestTaskGroup] = []


class TestTyping(TestTypingCreate):
    id: int


class Test(TestCreate):
    # TODO add
    # id: int
    pass


class TestTaskEntryQCMCreate(BaseModel):
    selected_id: int


class TestTaskEntryGapfillCreate(BaseModel):
    text: str


class TestTaskEntryCreate(BaseModel):
    code: str
    user_id: int
    test_task_id: int
    test_group_id: int
    test_question_id: int
    response_time: float

    entry_qcm: TestTaskEntryQCMCreate | None = None
    entry_gapfill: TestTaskEntryGapfillCreate | None = None

    @model_validator(mode="after")
    def check_entry_type(self) -> Self:
        if self.entry_qcm is None and self.entry_gapfill is None:
            raise ValueError("QCM or Gapfill must be provided")
        if self.entry_qcm is not None and self.entry_gapfill is not None:
            raise ValueError("QCM and Gapfill cannot be provided at the same time")
        return self

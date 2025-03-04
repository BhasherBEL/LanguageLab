from typing_extensions import Self
from pydantic import BaseModel, model_validator


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


class TestTaskQuestionQCM(BaseModel):
    correct: int
    options: list[str]

    model_config = {"from_attributes": True}

    @model_validator(mode="before")
    @classmethod
    def extract_options(cls, data):
        if hasattr(data, "__dict__"):
            result = {"correct": getattr(data, "correct", None), "options": []}

            for i in range(1, 9):
                option_value = getattr(data, f"option{i}", None)
                if option_value is not None and option_value != "":
                    result["options"].append(option_value)

            return result
        return data


class TestTaskQuestion(BaseModel):
    id: int
    question: str | None = None
    question_qcm: TestTaskQuestionQCM | None = None


class TestTaskGroupCreate(BaseModel):
    # TODO remove
    id: int | None = None
    title: str
    demo: bool = False
    randomize: bool = True


class TestTypingCreate(BaseModel):
    explanations: str
    text: str
    repeat: int | None = None
    duration: int | None = None


class TestTaskGroup(TestTaskGroupCreate):
    # id: int
    questions: list[TestTaskQuestion] = []


class TestTaskCreate(BaseModel):
    groups: list[TestTaskGroup] = []


class TestTask(TestTaskCreate):
    pass


class TestCreate(BaseModel):
    # TODO remove
    id: int | None = None
    title: str
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


class TestTyping(TestTypingCreate):
    pass


class Test(BaseModel):
    id: int
    title: str
    test_typing: TestTyping | None = None
    test_task: TestTask | None = None


class TestTaskEntryQCMCreate(BaseModel):
    selected_id: int


class TestTaskEntryGapfillCreate(BaseModel):
    text: str


class TestTaskEntryCreate(BaseModel):
    test_group_id: int
    test_question_id: int
    response_time: float

    entry_task_qcm: TestTaskEntryQCMCreate | None = None
    entry_task_gapfill: TestTaskEntryGapfillCreate | None = None

    @model_validator(mode="after")
    def check_entry_type(self) -> Self:
        if self.entry_task_qcm is None and self.entry_task_gapfill is None:
            raise ValueError("QCM or Gapfill must be provided")
        if self.entry_task_qcm is not None and self.entry_task_gapfill is not None:
            raise ValueError("QCM and Gapfill cannot be provided at the same time")
        return self


class TestTypingEntryCreate(BaseModel):
    position: int
    downtime: int
    uptime: int
    key_code: int
    key_value: str


class TestEntryCreate(BaseModel):
    code: str
    rid: str | None = None
    user_id: int | None = None
    test_id: int

    entry_task: TestTaskEntryCreate | None = None
    entry_typing: TestTypingEntryCreate | None = None

    @model_validator(mode="after")
    def check_entry_type(self) -> Self:
        if self.entry_task is None and self.entry_typing is None:
            raise ValueError("Task or Typing must be provided")
        if self.entry_task is not None and self.entry_typing is not None:
            raise ValueError("Task and Typing cannot be provided at the same time")
        return self

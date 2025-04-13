from pydantic import BaseModel, NaiveDatetime


class TaskCreate(BaseModel):
    level: str
    shortTitle: str
    instructions: str
    learnerInstructions: str
    examples: str


class Task(TaskCreate):
    id: int


class TaskStatusCreate(BaseModel):
    task_id: int
    student_id: int
    tutor_id: int
    session_id: int
    status: str
    created_at: NaiveDatetime | None = None


class TaskStatus(TaskStatusCreate):
    id: int

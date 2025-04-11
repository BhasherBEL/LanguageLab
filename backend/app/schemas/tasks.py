from pydantic import BaseModel


class TaskCreate(BaseModel):
    level: str
    shortTitle: str
    instructions: str
    learnerInstructions: str
    examples: str


class Task(TaskCreate):
    id: int

from pydantic import BaseModel

from models import UserType

class User(BaseModel):
    id: int
    username: str
    type: int
    is_active: bool

    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    username: str
    password: str
    type: int = UserType.STUDENT.value
    is_active: bool = True

class UserLogin(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    refresh_token: str

    class Config:
        from_attributes = True
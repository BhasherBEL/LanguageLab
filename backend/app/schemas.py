from pydantic import BaseModel

from models import UserType
import datetime

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

class TokenPayload(BaseModel):
    sub: str | None = None
    exp: int | None = None

    class Config:
        from_attributes = True

class Session(BaseModel):
    id: int
    token: str
    is_active: bool
    users: list[User]
    created_at: datetime.datetime

    class Config:
        from_attributes = True
        
class SessionUpdate(BaseModel):
    token: str | None = None
    is_active: bool | None = None

    class Config:
        from_attributes = True

class Message(BaseModel):
    id: int
    content: str
    user_id: int
    session_id: int
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class MessageCreate(BaseModel):
    content: str

    class Config:
        from_attributes = True
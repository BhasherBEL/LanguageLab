from pydantic import BaseModel

from models import UserType
import datetime

class User(BaseModel):
    id: int
    email: str
    nickname: str
    type: int
    is_active: bool

    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    email: str
    nickname: str | None = None
    password: str
    type: int = UserType.STUDENT.value
    is_active: bool = True

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
    created_at: datetime.datetime
    is_active: bool
    users: list[User]
    start_time: datetime.datetime
    end_time: datetime.datetime

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

    def to_dict(self):
        return {
            "id": self.id,
            "content": self.content,
            "user_id": self.user_id,
            "session_id": self.session_id,
            "created_at": self.created_at.isoformat(),
        }

class MessageCreate(BaseModel):
    content: str

    class Config:
        from_attributes = True
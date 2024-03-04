from pydantic import BaseModel

from models import UserType

class User(BaseModel):
    id: int
    username: str
    type: int
    is_active: bool

    class Config:
        from_attributes = True

    def toJSON(self):
        return {
            "id": self.id,
            "username": self.username,
            "type": self.type,
            "is_active": self.is_active
        }

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
    sub: str = None
    exp: int = None

    class Config:
        from_attributes = True
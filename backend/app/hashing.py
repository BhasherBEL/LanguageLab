from passlib.context import CryptContext
from jose import jwt, exceptions as jwte
from datetime import date, datetime, timedelta, UTC
from pydantic import ValidationError
from fastapi import HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

import config
import schemas
import models
from database import get_db 
import crud

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


reuseable_oauth = OAuth2PasswordBearer(
    tokenUrl="/login",
    scheme_name="JWT"
)


class Hasher():
    @staticmethod
    def verify_password(plain_password, hashed_password):
        return pwd_context.verify(plain_password, hashed_password)

    @staticmethod
    def get_password_hash(password):
        return pwd_context.hash(password)

def create_access_token(user: models.User, expires_delta: int = -1) -> str:
    if expires_delta < 0:
        expires_delta = int(datetime.now(UTC).timestamp()) + expires_delta
    else:
        expires_delta = int((datetime.now(UTC) + timedelta(minutes=config.ACCESS_TOKEN_EXPIRE_MINUTES)).timestamp())
    
    to_encode = {"exp": expires_delta, "sub": str(user.id), "type": user.type, "username": user.username, "is_active": user.is_active}
    encoded_jwt = jwt.encode(to_encode, config.JWT_SECRET_KEY, config.ALGORITHM)
    return encoded_jwt

def create_refresh_token(user: models.User, expires_delta: int = -1) -> str:
    if expires_delta < 0:
        expires_delta = int(datetime.now(UTC).timestamp()) + expires_delta
    else:
        expires_delta = int((datetime.now(UTC) + timedelta(minutes=config.REFRESH_TOKEN_EXPIRE_MINUTES)).timestamp())
    
    to_encode = {"exp": expires_delta, "sub": str(user.id), "type": user.type, "username": user.username, "is_active": user.is_active}
    encoded_jwt = jwt.encode(to_encode, config.JWT_REFRESH_SECRET_KEY, config.ALGORITHM)
    return encoded_jwt

def get_jwt_user(token: str = Depends(reuseable_oauth), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, config.JWT_SECRET_KEY, algorithms=[config.ALGORITHM])
        token_data = schemas.TokenPayload(**payload)

        if datetime.utcfromtimestamp(token_data.exp) < datetime.utcnow():
            raise HTTPException(status_code=401, detail="Token has expired")

        db_user = crud.get_user(db, user_id=int(token_data.sub))
    
    except jwte.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")

    except(jwte.JWTError, jwte.ExpiredSignatureError, ValidationError, ValueError) as e:
        print(e)
        raise HTTPException(status_code=403, detail="Invalid token")


    return db_user
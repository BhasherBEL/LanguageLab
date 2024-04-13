from fastapi import Security, HTTPException, status, Depends
from fastapi_jwt import JwtAccessBearerCookie, JwtAuthorizationCredentials
from datetime import timedelta
from sqlalchemy.orm import Session

import config
from database import get_db
import crud
from models import User

jwt_cookie = JwtAccessBearerCookie(
    secret_key=config.JWT_SECRET_KEY,
    auto_error=False,
    access_expires_delta=timedelta(minutes=config.ACCESS_TOKEN_EXPIRE_MINUTES),
    refresh_expires_delta=timedelta(minutes=config.REFRESH_TOKEN_EXPIRE_MINUTES),
)


def get_jwt_user(
    credentials: JwtAuthorizationCredentials = Security(jwt_cookie),
    db: Session = Depends(get_db),
):

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    print("AYAY")

    if not credentials:
        raise credentials_exception

    user: User = crud.get_user(db, user_id=credentials.subject["uid"])

    if not user:
        raise credentials_exception

    return user

from typing import Callable

from fastapi import HTTPException

import schemas
from utils import check_user_level


def require_admin(error: str):
    def decorator(func: Callable):
        def wrapper(*args, current_user: schemas.User, **kwargs):
            if not check_user_level(current_user, schemas.UserType.ADMIN):
                raise HTTPException(
                    status_code=401,
                    detail=error,
                )
            return func(*args, current_user=current_user, **kwargs)

        return wrapper

    return decorator

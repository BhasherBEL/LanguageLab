import schemas

def check_user_level(user: schemas.User, required_level: schemas.UserType):
    if user.type > required_level.value:
        return False
    return True
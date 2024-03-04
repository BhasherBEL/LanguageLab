import models

def check_user_level(user: models.User, required_level: models.UserType):
    if user.type > required_level.value:
        return False
    return True
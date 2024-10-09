import datetime


def check_user_level(user, required_level):
    if user.type > required_level.value:
        return False
    return True


def datetime_aware():
    return datetime.datetime.now().astimezone(datetime.timezone.utc)

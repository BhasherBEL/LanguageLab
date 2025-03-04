import datetime
import re


def check_user_level(user, required_level):
    if user.type > required_level.value:
        return False
    return True


def datetime_aware():
    return datetime.datetime.now().astimezone(datetime.timezone.utc)


def extract_text_between_angle_bracket(text):
    pattern = r"<(.*?)>"
    match = re.search(pattern, text)
    if match:
        return match.group(1)
    return None

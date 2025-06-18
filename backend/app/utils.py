import datetime
import re


def check_user_level(user, required_level):
    # For human users, check the type from human_user
    if user.human_user:
        if user.human_user.type > required_level.value:
            return False
        return True
    # For agent users, assume they don't have admin privileges
    elif user.agent_user:
        # Agent users are typically treated as students (type 2) unless specified otherwise
        if 2 > required_level.value:
            return False
        return True
    # If no human_user or agent_user, deny access
    return False


def datetime_aware():
    return datetime.datetime.now().astimezone(datetime.timezone.utc)


def extract_text_between_angle_bracket(text):
    pattern = r"<(.*?)>"
    match = re.search(pattern, text)
    if match:
        return match.group(1)
    return None

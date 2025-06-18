import datetime
from sqlalchemy.orm import Session
import secrets

from utils import datetime_aware
import models
import schemas
from hashing import Hasher

from crud.tests import *
from crud.studies import *
from crud.tasks import *


def get_user(db: Session, user_id: int):
    user = db.query(models.User).filter(models.User.id == user_id).first()

    return user


def get_user_by_email(db: Session, email: str):
    return (
        db.query(models.User)
        .join(models.HumanUser)
        .filter(models.HumanUser.email == email.lower())
        .first()
    )


def get_user_by_email_and_password(db: Session, email: str, password: str):
    user_db = get_user_by_email(db, email)
    if user_db is None:
        return None
    if not Hasher.verify_password(password, user_db.human_user.password):
        return None
    return user_db


def get_users(db: Session, skip: int = 0):
    return db.query(models.User).offset(skip).all()


def create_user(db: Session, user: schemas.UserCreate) -> models.User:
    if user.human_user:
        password = Hasher.get_password_hash(user.human_user.password)
        nickname = (
            user.nickname if user.nickname else user.human_user.email.split("@")[0]
        )
        db_user = models.User(
            nickname=nickname,
            is_active=user.is_active,
            human_user=models.HumanUser(
                email=user.human_user.email.lower(),
                password=password,
                type=user.human_user.type,
                bio=user.human_user.bio,
                ui_language=user.human_user.ui_language,
                home_language=user.human_user.home_language,
                target_language=user.human_user.target_language,
                birthdate=user.human_user.birthdate,
                gender=user.human_user.gender,
                calcom_link=user.human_user.calcom_link,
                last_survey=user.human_user.last_survey,
                availabilities=user.human_user.availabilities,
                tutor_list=user.human_user.tutor_list,
                my_tutor=user.human_user.my_tutor,
                my_slots=user.human_user.my_slots,
            ),
        )
    elif user.agent_user:
        nickname = user.nickname if user.nickname else "Agent"
        db_user = models.User(
            nickname=nickname,
            is_active=user.is_active,
            agent_user=models.AgentUser(
                model=user.agent_user.model,
                system_prompt=user.agent_user.system_prompt,
                is_in_pool=user.agent_user.is_in_pool,
            ),
        )
    else:
        raise ValueError("Either human_user or agent_user user data must be provided")

    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def delete_user(db: Session, user_id: int):
    db.query(models.User).filter(models.User.id == user_id).delete()
    db.commit()
    return None


def update_user(db: Session, user: schemas.UserUpdate, user_id: int):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        return False

    # Update base user fields
    user_updates = {}
    if user.nickname is not None:
        user_updates["nickname"] = user.nickname
    if user.is_active is not None:
        user_updates["is_active"] = user.is_active

    if user_updates:
        db.query(models.User).filter(models.User.id == user_id).update(user_updates)

    # Update human user fields
    if user.human_user and db_user.human_user:
        human_data = user.human_user.model_dump(exclude_unset=True)
        if "password" in human_data:
            human_data["password"] = Hasher.get_password_hash(human_data["password"])
        if human_data:
            db.query(models.HumanUser).filter(
                models.HumanUser.user_id == user_id
            ).update(human_data)

    # Update agent user fields
    if user.agent_user and db_user.agent_user:
        agent_data = user.agent_user.model_dump(exclude_unset=True)
        if agent_data:
            db.query(models.AgentUser).filter(
                models.AgentUser.user_id == user_id
            ).update(agent_data)

    db.commit()
    return True


def create_contact(db: Session, user, contact):
    user.contacts.append(contact)
    db.commit()
    db.refresh(user)
    return user


def create_user_survey_weekly(
    db: Session, user_id: int, survey: schemas.UserSurveyWeeklyCreate
):
    db_user_survey_weekly = models.UserSurveyWeekly(
        user_id=user_id, **survey.model_dump()
    )
    db.add(db_user_survey_weekly)
    db.commit()
    db.refresh(db_user_survey_weekly)
    return db_user_survey_weekly


def get_contact_sessions(db: Session, user_id: int, contact_id: int):
    sessions = (
        db.query(models.Session)
        .filter(models.Session.users.any(models.User.id == user_id))
        .filter(models.Session.users.any(models.User.id == contact_id))
        .all()
    )
    for session in sessions:
        session.length = (
            db.query(models.Message)
            .filter(models.Message.session_id == session.id)
            .count()
        )

    return sessions


def create_session(db: Session, user: schemas.User):
    db_session = models.Session(is_active=True, users=[user])
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session


def create_session_with_users(
    db: Session,
    users: list[schemas.User],
    start_time: datetime.datetime | None = datetime_aware(),
    end_time: datetime.datetime | None = datetime_aware()
    + datetime.timedelta(hours=12),
):
    db_session = models.Session(
        is_active=True, users=users, start_time=start_time, end_time=end_time
    )
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session


def get_session(db: Session, session_id: int):
    session = db.query(models.Session).filter(models.Session.id == session_id).first()

    return session


def get_sessions(db: Session, user: schemas.User, skip: int = 0):
    # Check if user is admin (type 0) or tutor (type 1)
    user_type = user.human_user.type if user.human_user else 999
    if user_type < 2:
        # Admin or tutor can see all sessions they're part of
        sessions = (
            db.query(models.Session)
            .filter(models.Session.users.any(models.User.id == user.id))
            .offset(skip)
            .all()
        )
    else:
        # Students can only see active sessions
        sessions = (
            db.query(models.Session)
            .filter(models.Session.users.any(models.User.id == user.id))
            .filter(models.Session.is_active == True)
            .offset(skip)
            .all()
        )

    return sessions


def get_all_sessions(db: Session, skip: int = 0):
    sessions = db.query(models.Session).offset(skip).all()

    for session in sessions:
        session.length = (
            db.query(models.Message)
            .filter(models.Message.session_id == session.id)
            .count()
        )

    return sessions


def delete_session(db: Session, session_id: int):
    db.query(models.Session).filter(models.Session.id == session_id).delete()
    db.commit()


def update_session(db: Session, session: schemas.SessionUpdate, session_id: int):
    db.query(models.Session).filter(models.Session.id == session_id).update(
        session.model_dump(exclude_unset=True)
    )
    db.commit()


def create_session_satisfy(
    db: Session, user_id: int, session_id: int, satisfy: schemas.SessionSatisfyCreate
):
    db_satisfy = models.SessionSatisfy(
        user_id=user_id, session_id=session_id, **satisfy.model_dump()
    )
    db.add(db_satisfy)
    db.commit()
    db.refresh(db_satisfy)
    return db_satisfy


def get_message(db: Session, message_id: int):
    return db.query(models.Message).filter(models.Message.id == message_id).first()


def get_messages(db: Session, session_id: int, skip: int = 0):
    return (
        db.query(models.Message)
        .filter(models.Message.session_id == session_id)
        .offset(skip)
        .all()
    )


def get_all_messages(db: Session, skip: int = 0):
    return db.query(models.Message).offset(skip).all()


def get_all_metadata(db: Session, skip: int = 0):
    return db.query(models.MessageMetadata).offset(skip).all()


def get_all_feedbacks(db: Session, skip: int = 0):
    return db.query(models.MessageFeedback).offset(skip).all()


def create_message(
    db: Session,
    message: schemas.MessageCreate,
    user: schemas.User,
    session: schemas.Session,
):

    if message.message_id is None:
        message.message_id = secrets.token_urlsafe(24)

    db_message = models.Message(
        content=message.content,
        user_id=user.id,
        session_id=session.id,
        message_id=message.message_id,
        reply_to_message_id=message.reply_to_message_id,
    )
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message


def create_message_metadata(
    db: Session, message_id: int, metadata: schemas.MessageMetadataCreate
):
    db_message_metadata = models.MessageMetadata(
        message_id=message_id, **metadata.model_dump()
    )
    db.add(db_message_metadata)
    db.commit()
    db.refresh(db_message_metadata)
    return db_message_metadata


def create_message_feedback(
    db: Session,
    message_id: int,
    feedback: schemas.MessageFeedbackCreate,
):
    db_message_feedback = models.MessageFeedback(
        message_id=message_id, **feedback.model_dump()
    )
    db.add(db_message_feedback)
    db.commit()
    db.refresh(db_message_feedback)
    return db_message_feedback


def get_message_feedback(db: Session, feedback_id: int):
    return (
        db.query(models.MessageFeedback)
        .filter(models.MessageFeedback.id == feedback_id)
        .first()
    )


def delete_message_feedback(db: Session, feedback_id: int):
    db.query(models.MessageFeedback).filter(
        models.MessageFeedback.id == feedback_id
    ).delete()
    db.commit()

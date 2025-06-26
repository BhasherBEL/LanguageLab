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
    return db.query(models.User).filter(models.User.email == email.lower()).first()


def get_user_by_email_and_password(db: Session, email: str, password: str):
    user_db = get_user_by_email(db, email)
    if user_db is None:
        return None
    if not Hasher.verify_password(password, user_db.password):
        return None
    return user_db


def get_users(db: Session, skip: int = 0):
    return db.query(models.User).offset(skip).all()


def get_tutors_by_study(db: Session, study_id: int):
    tutors = (
        db.query(models.User)
        .filter(models.User.type == models.UserType.TUTOR.value)
        .filter(models.User.studies.any(models.Study.id == study_id))
        .all()
    )

    for tutor in tutors:
        current_learners = (
            db.query(models.User).filter(models.User.my_tutor == tutor.email).count()
        )
        tutor.current_learners = current_learners
        tutor.available_slots = max(0, (tutor.max_learners or 10) - current_learners)
        tutor.is_available = tutor.available_slots > 0

    return tutors


def create_user(db: Session, user: schemas.UserCreate) -> models.User:
    password = Hasher.get_password_hash(user.password)
    nickname = user.nickname if user.nickname else user.email.split("@")[0]
    db_user = models.User(
        email=user.email.lower(),
        nickname=nickname,
        password=password,
        type=user.type,
        is_active=user.is_active,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def delete_user(db: Session, user_id: int):
    db.query(models.User).filter(models.User.id == user_id).delete()
    db.commit()
    return None


def update_user(db: Session, user: schemas.UserUpdate, user_id: int):
    cnt = (
        db.query(models.User)
        .filter(models.User.id == user_id)
        .update(user.dict(exclude_unset=True))
    )
    db.commit()
    return cnt > 0


def create_contact(db: Session, user, contact):
    user.contacts.append(contact)
    db.commit()
    db.refresh(user)
    return user


def create_user_survey_weekly(db: Session, user_id: int, survey: schemas.SurveyCreate):
    db_user_survey_weekly = models.UserSurveyWeekly(user_id=user_id, **survey.dict())
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
    sessions = (
        db.query(models.Session)
        .filter(models.Session.users.any(models.User.id == user.id))
        .filter(models.Session.is_active or user.type < 2)
        # .filter(models.Session.end_time >= datetime.datetime.now())
        # .filter(models.Session.start_time <= datetime.datetime.now())
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
        session.dict(exclude_unset=True)
    )
    db.commit()


def create_session_satisfy(
    db: Session, user_id: int, session_id: int, satisfy: schemas.SessionSatisfyCreate
):
    db_satisfy = models.SessionSatisfy(
        user_id=user_id, session_id=session_id, **satisfy.dict()
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
        message_id=message_id, **metadata.dict()
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
        message_id=message_id, **feedback.dict()
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
    # First get the feedback object to trigger cascade deletion
    db_feedback = db.query(models.MessageFeedback).filter(
        models.MessageFeedback.id == feedback_id
    ).first()
    
    if db_feedback:
        # Delete the object (this will trigger cascade deletion of replies)
        db.delete(db_feedback)
        db.commit()


def create_test_typing(db: Session, test: schemas.TestTypingCreate):
    db_test = models.TestTyping(code=test.code)
    db.add(db_test)
    db.commit()
    db.refresh(db_test)
    return db_test


def create_test_typing_entry(
    db: Session, entry: schemas.TestTypingEntryCreate, typing_id: int
):
    db_entry = models.TestTypingEntry(typing_id=typing_id, **entry.dict())
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry


# Feedback Reply CRUD operations
def create_feedback_reply(
    db: Session,
    feedback_id: int,
    user_id: int,
    reply: schemas.FeedbackReplyCreate,
):
    db_feedback_reply = models.FeedbackReply(
        feedback_id=feedback_id,
        user_id=user_id,
        content=reply.content,
    )
    db.add(db_feedback_reply)
    db.commit()
    db.refresh(db_feedback_reply)
    return db_feedback_reply


def get_feedback_replies(db: Session, feedback_id: int):
    return (
        db.query(models.FeedbackReply)
        .filter(models.FeedbackReply.feedback_id == feedback_id)
        .order_by(models.FeedbackReply.created_at.desc())
        .all()
    )


def get_feedback_reply(db: Session, reply_id: int):
    return (
        db.query(models.FeedbackReply)
        .filter(models.FeedbackReply.id == reply_id)
        .first()
    )


def update_feedback_reply(
    db: Session,
    reply_id: int,
    reply: schemas.FeedbackReplyUpdate,
):
    db.query(models.FeedbackReply).filter(
        models.FeedbackReply.id == reply_id
    ).update(reply.dict(exclude_unset=True))
    db.commit()
    db.refresh(
        db.query(models.FeedbackReply)
        .filter(models.FeedbackReply.id == reply_id)
        .first()
    )
    return (
        db.query(models.FeedbackReply)
        .filter(models.FeedbackReply.id == reply_id)
        .first()
    )


def delete_feedback_reply(db: Session, reply_id: int):
    db.query(models.FeedbackReply).filter(
        models.FeedbackReply.id == reply_id
    ).delete()
    db.commit()

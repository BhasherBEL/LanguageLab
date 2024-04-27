import datetime
from sqlalchemy.orm import Session
import secrets

import models
import schemas
from hashing import Hasher


def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()


def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email.lower()).first()


def get_user_by_email_and_password(db: Session, email: str, password: str):
    user_db = get_user_by_email(db, email)
    if user_db is None:
        return None
    if not Hasher.verify_password(password, user_db.password):
        return None
    return user_db


def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()


def create_user(db: Session, user: schemas.UserCreate):
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


def create_user_metadata(
    db: Session, user_id: int, metadata: schemas.UserMetadataCreate
):
    db_user_metadata = models.UserMetadata(user_id=user_id, **metadata.dict())
    db.add(db_user_metadata)
    db.commit()
    db.refresh(db_user_metadata)
    return db_user_metadata


def update_user_metadata(
    db: Session, user_id: int, metadata: schemas.UserMetadataUpdate
):
    cnt = (
        db.query(models.UserMetadata)
        .filter(models.UserMetadata.user_id == user_id)
        .update(metadata.dict(exclude_unset=True, exclude_none=True))
    )
    db.commit()
    return cnt > 0


def get_user_metadata(db: Session, user_id: int):
    return (
        db.query(models.UserMetadata)
        .filter(models.UserMetadata.user_id == user_id)
        .first()
    )


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


def create_session(db: Session, user: schemas.User):
    db_session = models.Session(is_active=True, users=[user])
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session


def create_session_with_users(
    db: Session,
    users: list[schemas.User],
    start_time: datetime.datetime | None = None,
    end_time: datetime.datetime | None = None,
):
    db_session = models.Session(
        is_active=True, users=users, start_time=start_time, end_time=end_time
    )
    db.add(db_session)
    db.commit()
    db.refresh(db_session)
    return db_session


def get_session(db: Session, session_id: int):
    return db.query(models.Session).filter(models.Session.id == session_id).first()


def get_sessions(db: Session, user: schemas.User, skip: int = 0, limit: int = 100):
    return (
        db.query(models.Session)
        .filter(models.Session.users.any(models.User.id == user.id))
        .filter(models.Session.is_active or user.type < 2)
        .filter(models.Session.end_time >= datetime.datetime.now())
        .filter(models.Session.start_time <= datetime.datetime.now())
        .offset(skip)
        .limit(limit)
        .all()
    )


def get_all_sessions(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Session).offset(skip).limit(limit).all()


def delete_session(db: Session, session_id: int):
    db.query(models.Session).filter(models.Session.id == session_id).delete()
    db.commit()


def update_session(db: Session, session: schemas.SessionUpdate, session_id: int):
    db.query(models.Session).filter(models.Session.id == session_id).update(
        session.dict(exclude_unset=True)
    )
    db.commit()


def get_messages(db: Session, session_id: int, skip: int = 0, limit: int = 100):
    return (
        db.query(models.Message)
        .filter(models.Message.session_id == session_id)
        .offset(skip)
        .limit(limit)
        .all()
    )


def create_message(
    db: Session,
    message: schemas.MessageCreate,
    user: schemas.User,
    session: schemas.Session,
):
    db_message = models.Message(
        content=message.content, user_id=user.id, session_id=session.id
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


def create_test_typing(db: Session, test: schemas.TestTypingCreate, user: schemas.User):
    db_test = models.TestTyping(user_id=user.id)
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


def create_test_vocabulary(db: Session, test: schemas.TestVocabularyCreate):
    db_test = models.TestVocabulary(**test.dict())
    db.add(db_test)
    db.commit()
    db.refresh(db_test)
    return db_test

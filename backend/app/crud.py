from sqlalchemy.orm import Session
import secrets

import models, schemas
from hashing import Hasher


def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()


def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username.lower()).first()


def get_user_by_username_and_password(db: Session, username: str, password: str):
    user_db = get_user_by_username(db, username)
    if user_db is None:
        return None
    if not Hasher.verify_password(password, user_db.password):
        return None
    return user_db


def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()


def create_user(db: Session, user: schemas.UserCreate):
    password = Hasher.get_password_hash(user.password)
    db_user = models.User(username=user.username.lower(), password=password, type=user.type, is_active=user.is_active)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: int):
    db.query(models.User).filter(models.User.id == user_id).delete()
    db.commit()
    return None

def create_session(db: Session, user: schemas.User):
    token = secrets.token_urlsafe(32)
    db_session = models.Session(token=token, is_active=True, users=[user])
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
    db.query(models.Session).filter(models.Session.id == session_id).update(session.dict(exclude_unset=True))
    db.commit()

def get_messages(db: Session, session_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Message).filter(models.Message.session_id == session_id).offset(skip).limit(limit).all()

def create_message(db: Session, message: schemas.MessageCreate, user: schemas.User, session: schemas.Session):
    db_message = models.Message(content=message.content, user_id=user.id, session_id=session.id)
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message
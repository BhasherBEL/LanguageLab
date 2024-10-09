import datetime
from sqlalchemy.orm import Session
import secrets

from utils import datetime_aware
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


def get_users(db: Session, skip: int = 0):
    return db.query(models.User).offset(skip).all()


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
    return (
        db.query(models.Session)
        .filter(models.Session.users.any(models.User.id == user_id))
        .filter(models.Session.users.any(models.User.id == contact_id))
        .all()
    )


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


def create_study(db: Session, study: schemas.StudyCreate):
    db_study = models.Study(**study.dict())
    db.add(db_study)
    db.commit()
    db.refresh(db_study)
    return db_study


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


def create_survey(db: Session, survey: schemas.SurveyCreate):
    db_survey = models.SurveySurvey(**survey.dict())
    db.add(db_survey)
    db.commit()
    db.refresh(db_survey)
    return db_survey


def get_survey(db: Session, survey_id: int):
    return (
        db.query(models.SurveySurvey)
        .filter(models.SurveySurvey.id == survey_id)
        .first()
    )


def get_surveys(db: Session, skip: int = 0):
    return db.query(models.SurveySurvey).offset(skip).all()


def delete_survey(db: Session, survey_id: int):
    db.query(models.SurveySurvey).filter(models.SurveySurvey.id == survey_id).delete()
    db.commit()


def add_group_to_survey(db: Session, survey_id: int, group: schemas.SurveyGroup):
    db_survey = (
        db.query(models.SurveySurvey)
        .filter(models.SurveySurvey.id == survey_id)
        .first()
    )
    db_survey.groups.append(group)
    db.commit()
    db.refresh(db_survey)
    return db_survey


def remove_group_from_survey(db: Session, survey_id: int, group_id: int):
    survey = (
        db.query(models.SurveySurvey)
        .filter(models.SurveySurvey.id == survey_id)
        .first()
    )

    survey_group = (
        db.query(models.SurveyGroup).filter(models.SurveyGroup.id == group_id).first()
    )

    if survey_group in survey.groups:
        survey.groups.remove(survey_group)
        db.commit()


def create_survey_group(db: Session, survey_group: schemas.SurveyGroupCreate):
    db_survey_group = models.SurveyGroup(**survey_group.dict())
    db.add(db_survey_group)
    db.commit()
    db.refresh(db_survey_group)
    return db_survey_group


def get_survey_group(db: Session, survey_group_id: int) -> schemas.SurveyGroup:
    return (
        db.query(models.SurveyGroup)
        .filter(models.SurveyGroup.id == survey_group_id)
        .first()
    )


def get_survey_groups(db: Session, skip: int = 0):
    return db.query(models.SurveyGroup).offset(skip).all()


def delete_survey_group(db: Session, survey_group_id: int):
    db.query(models.SurveyGroup).filter(
        models.SurveyGroup.id == survey_group_id
    ).delete()
    db.commit()


def add_item_to_survey_group(db: Session, group_id: int, item: models.SurveyQuestion):
    db_survey_group = (
        db.query(models.SurveyGroup).filter(models.SurveyGroup.id == group_id).first()
    )
    db_survey_group.questions.append(item)
    db.commit()
    db.refresh(db_survey_group)
    return db_survey_group


def remove_item_from_survey_group(db: Session, group_id: int, item_id: int):
    survey_group = (
        db.query(models.SurveyGroup).filter(models.SurveyGroup.id == group_id).first()
    )

    survey_question = (
        db.query(models.SurveyQuestion)
        .filter(models.SurveyQuestion.id == item_id)
        .first()
    )

    if survey_question in survey_group.questions:
        survey_group.questions.remove(survey_question)
        db.commit()


def create_survey_question(db: Session, survey_question: schemas.SurveyQuestionCreate):
    db_survey_question = models.SurveyQuestion(**survey_question.dict())
    db.add(db_survey_question)
    db.commit()
    db.refresh(db_survey_question)
    return db_survey_question


def get_survey_question(db: Session, survey_question_id: int):
    return (
        db.query(models.SurveyQuestion)
        .filter(models.SurveyQuestion.id == survey_question_id)
        .first()
    )


def get_survey_questions(db: Session, skip: int = 0):
    return db.query(models.SurveyQuestion).offset(skip).all()


def delete_survey_question(db: Session, survey_question_id: int):
    db.query(models.SurveyQuestion).filter(
        models.SurveyQuestion.id == survey_question_id
    ).delete()
    db.commit()


def create_survey_response(db: Session, survey_response: schemas.SurveyResponseCreate):
    db_survey_response = models.SurveyResponse(**survey_response.dict())
    db.add(db_survey_response)
    db.commit()
    db.refresh(db_survey_response)
    return db_survey_response


def get_survey_responses(db: Session, survey_id: int, skip: int = 0):
    return (
        db.query(models.SurveyResponse)
        .filter(models.SurveyResponse.survey_id == survey_id)
        .offset(skip)
        .all()
    )

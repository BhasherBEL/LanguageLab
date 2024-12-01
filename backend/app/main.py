from collections import defaultdict
import datetime
from typing import Annotated
from fastapi import (
    APIRouter,
    FastAPI,
    Form,
    status,
    Depends,
    HTTPException,
    BackgroundTasks,
    Header,
    Response,
)
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware
from fastapi.websockets import WebSocket
from fastapi.responses import StreamingResponse
from contextlib import asynccontextmanager
import json
from jose import jwt
from io import StringIO
import csv

import schemas
import crud
import models
from database import Base, engine, get_db, SessionLocal
from utils import check_user_level
import config
from security import jwt_cookie, get_jwt_user

websocket_users = defaultdict(lambda: defaultdict(set))


@asynccontextmanager
async def lifespan(app: FastAPI):
    db = SessionLocal()
    try:
        if crud.get_user_by_email(db, config.ADMIN_EMAIL) is None:
            crud.create_user(
                db,
                schemas.UserCreate(
                    email=config.ADMIN_EMAIL,
                    nickname=config.ADMIN_NICKNAME,
                    password=config.ADMIN_PASSWORD,
                    type=models.UserType.ADMIN.value,
                ),
            )
    finally:
        db.close()
    yield


Base.metadata.create_all(bind=engine)

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

apiRouter = APIRouter(prefix="/api")
v1Router = APIRouter(prefix="/v1")
authRouter = APIRouter(prefix="/auth", tags=["auth"])
usersRouter = APIRouter(prefix="/users", tags=["users"])
sessionsRouter = APIRouter(prefix="/sessions", tags=["sessions"])
studyRouter = APIRouter(prefix="/studies", tags=["studies"])
websocketRouter = APIRouter(prefix="/ws", tags=["websocket"])
webhookRouter = APIRouter(prefix="/webhooks", tags=["webhook"])
surveyRouter = APIRouter(prefix="/surveys", tags=["surveys"])


@v1Router.get("/health", status_code=status.HTTP_204_NO_CONTENT)
def health():
    return


@authRouter.post("/login", status_code=200)
def login(
    email: Annotated[str, Form()],
    password: Annotated[str, Form()],
    response: Response,
    db: Session = Depends(get_db),
):
    db_user = crud.get_user_by_email_and_password(db, email, password)
    if db_user is None:
        raise HTTPException(status_code=401, detail="Incorrect email or password")

    subject = {"uid": db_user.id, "email": db_user.email, "nickname": db_user.nickname}
    access_token = jwt_cookie.create_access_token(subject)

    jwt_cookie.set_access_cookie(
        response=response,
        access_token=access_token,
        expires_delta=jwt_cookie.access_expires_delta,
    )

    refresh_token = jwt_cookie.create_refresh_token(subject)

    jwt_cookie.set_refresh_cookie(
        response=response,
        refresh_token=refresh_token,
        expires_delta=jwt_cookie.refresh_expires_delta,
    )


@authRouter.post("/register", status_code=status.HTTP_201_CREATED)
def register(
    email: Annotated[str, Form()],
    password: Annotated[str, Form()],
    nickname: Annotated[str, Form()],
    tutor: Annotated[bool, Form()],
    db: Session = Depends(get_db),
):
    db_user = crud.get_user_by_email(db, email=email)
    if db_user:
        raise HTTPException(status_code=400, detail="User already registered")

    user_data = schemas.UserCreate(
        email=email,
        password=password,
        nickname=nickname,
        type=models.UserType.TUTOR.value if tutor else models.UserType.STUDENT.value,
    )

    user = crud.create_user(db=db, user=user_data)

    return user.id


@usersRouter.post("", status_code=status.HTTP_201_CREATED)
def create_user(
    user: schemas.UserCreate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_jwt_user),
):
    if not check_user_level(current_user, models.UserType.ADMIN):
        raise HTTPException(
            status_code=401, detail="You do not have permission to create a user"
        )

    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="User already registered")

    user = crud.create_user(db=db, user=user)

    return user.id


@usersRouter.get("/{user_id}", response_model=schemas.User)
def read_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_jwt_user),
):
    if (
        not check_user_level(current_user, models.UserType.ADMIN)
        and current_user.id != user_id
    ):
        raise HTTPException(
            status_code=401, detail="You do not have permission to view this user"
        )

    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")

    return db_user


@usersRouter.get("", response_model=list[schemas.User])
def read_users(
    skip: int = 0,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_jwt_user),
):
    return crud.get_users(db, skip=skip)


@usersRouter.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_jwt_user),
):
    if not check_user_level(current_user, models.UserType.ADMIN):
        raise HTTPException(
            status_code=401, detail="You do not have permission to delete a user"
        )

    if not crud.delete_user(db, user_id):
        raise HTTPException(status_code=404, detail="User not found")


@usersRouter.patch("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def update_user(
    user_id: int,
    user: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_jwt_user),
):
    if (
        not check_user_level(current_user, models.UserType.ADMIN)
        and current_user.id != user_id
    ):
        raise HTTPException(
            status_code=401, detail="You do not have permission to update this user"
        )

    if not crud.update_user(db, user, user_id):
        raise HTTPException(status_code=404, detail="User not found")


@usersRouter.get("/{user_id}/sessions", response_model=list[schemas.Session])
def read_user_sessions(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_jwt_user),
):
    if (
        not check_user_level(current_user, models.UserType.ADMIN)
        and current_user.id != user_id
    ):
        raise HTTPException(
            status_code=401,
            detail="You do not have permission to view this user's sessions",
        )

    db_user = crud.get_user(db, user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")

    return db_user.sessions


@usersRouter.get(
    "/{user_id}/contacts/{contact_id}/sessions", response_model=list[schemas.Session]
)
def read_user_contact_sessions(
    user_id: int,
    contact_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_jwt_user),
):
    if (
        not check_user_level(current_user, models.UserType.ADMIN)
        and current_user.id != user_id
    ):
        raise HTTPException(
            status_code=401,
            detail="You do not have permission to view this user's sessions",
        )

    db_user = crud.get_user(db, user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")

    return crud.get_contact_sessions(db, user_id, contact_id)


def store_typing_entries(
    db, entries: list[schemas.TestTypingEntryCreate], typing_id: int
):
    for e in entries:
        crud.create_test_typing_entry(db, e, typing_id)
    pass


@usersRouter.post("/{user_id}/tests/typing", status_code=status.HTTP_201_CREATED)
def create_test_typing(
    user_id: int,
    test: schemas.TestTypingCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_jwt_user),
):
    if (
        not check_user_level(current_user, models.UserType.ADMIN)
        and current_user.id != user_id
    ):
        raise HTTPException(
            status_code=401,
            detail="You do not have permission to create a test for this user",
        )

    db_user = crud.get_user(db, user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")

    typing_id = crud.create_test_typing(db, test, db_user).id

    if test.entries:
        background_tasks.add_task(store_typing_entries, db, test.entries, typing_id)

    return typing_id


@usersRouter.post(
    "/{user_id}/contacts/{contact_id}", status_code=status.HTTP_201_CREATED
)
def create_contact(
    user_id: int,
    contact_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_jwt_user),
):
    if (
        not check_user_level(current_user, models.UserType.ADMIN)
        and current_user.id != user_id
    ):
        raise HTTPException(
            status_code=401,
            detail="You do not have permission to create a contact for this user",
        )

    db_user = crud.get_user(db, user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")

    db_contact = crud.get_user(db, contact_id)
    if db_contact is None:
        raise HTTPException(status_code=404, detail="Contact not found")

    return crud.create_contact(db, db_user, db_contact)


@usersRouter.post(
    "/{user_id}/contacts-email/{contact_email}", status_code=status.HTTP_201_CREATED
)
def create_contact_by_email(
    user_id: int,
    contact_email: str,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_jwt_user),
):
    if (
        not check_user_level(current_user, models.UserType.ADMIN)
        and current_user.id != user_id
    ):
        raise HTTPException(
            status_code=401,
            detail="You do not have permission to create a contact for this user",
        )

    db_user = crud.get_user(db, user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")

    db_contact = crud.get_user_by_email(db, contact_email)
    if db_contact is None:
        raise HTTPException(status_code=404, detail="Contact not found")

    if db_contact in db_user.contacts:
        raise HTTPException(
            status_code=400, detail="Contact already exists for this user"
        )

    return crud.create_contact(db, db_user, db_contact)


@usersRouter.get("/{user_id}/contacts", response_model=list[schemas.User])
def get_contacts(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_jwt_user),
):
    if (
        not check_user_level(current_user, models.UserType.ADMIN)
        and current_user.id != user_id
    ):
        raise HTTPException(
            status_code=401,
            detail="You do not have permission to view this user's contacts",
        )

    db_user = crud.get_user(db, user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")

    return db_user.contacts + db_user.contact_of


@usersRouter.post("/{user_id}/surveys/weekly", status_code=status.HTTP_201_CREATED)
def create_weekly_survey(
    user_id: int,
    survey: schemas.UserSurveyWeeklyCreate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_jwt_user),
):
    if (
        not check_user_level(current_user, models.UserType.ADMIN)
        and current_user.id != user_id
    ):
        raise HTTPException(
            status_code=401,
            detail="You do not have permission to create a survey for this user",
        )
    db_user = crud.get_user(db, user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")

    return crud.create_user_survey_weekly(db, user_id, survey).id


@usersRouter.post(
    "/{user_id}/contacts/{contact_id}/bookings", status_code=status.HTTP_201_CREATED
)
def create_booking(
    user_id: int,
    contact_id: int,
    booking: schemas.SessionBookingCreate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_jwt_user),
):
    if (
        not check_user_level(current_user, models.UserType.ADMIN)
        and current_user.id != user_id
    ):
        raise HTTPException(
            status_code=401,
            detail="You do not have permission to create a booking for this user",
        )
    db_user = crud.get_user(db, user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    db_contact = crud.get_user(db, contact_id)
    if db_contact is None:
        raise HTTPException(status_code=404, detail="Contact not found")
    return crud.create_session_with_users(
        db, [db_user, db_contact], booking.start_time, booking.end_time
    ).id


@sessionsRouter.post("", response_model=schemas.Session)
def create_session(
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_jwt_user),
):
    # if not check_user_level(current_user, models.UserType.TUTOR):
    #    raise HTTPException(
    #        status_code=401, detail="You do not have permission to create a session"
    #    )

    rep = crud.create_session(db, current_user)
    rep.length = 0

    return rep


@sessionsRouter.get("/{session_id}", response_model=schemas.Session)
def read_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_jwt_user),
):
    db_session = crud.get_session(db, session_id)
    if db_session is None:
        raise HTTPException(status_code=404, detail="Session not found")

    if (
        not check_user_level(current_user, models.UserType.ADMIN)
        and current_user not in db_session.users
    ):
        raise HTTPException(
            status_code=401, detail="You do not have permission to view this session"
        )

    return db_session


@sessionsRouter.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_jwt_user),
):
    if not check_user_level(current_user, models.UserType.ADMIN):
        raise HTTPException(
            status_code=401, detail="You do not have permission to delete a session"
        )

    crud.delete_session(db, session_id)


@sessionsRouter.patch("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def update_session(
    session_id: int,
    session: schemas.SessionUpdate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_jwt_user),
):
    db_session = crud.get_session(db, session_id)
    if db_session is None:
        raise HTTPException(status_code=404, detail="Session not found")

    if not check_user_level(current_user, models.UserType.TUTOR):
        raise HTTPException(
            status_code=401, detail="You do not have permission to update this session"
        )

    crud.update_session(db, session, session_id)


@sessionsRouter.get("/{session_id}/download/messages")
def download_session(
    session_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_jwt_user),
):
    db_session = crud.get_session(db, session_id)
    if db_session is None:
        raise HTTPException(status_code=404, detail="Session not found")

    if not check_user_level(current_user, models.UserType.ADMIN):
        raise HTTPException(
            status_code=401,
            detail="You do not have permission to download this session",
        )

    data = crud.get_messages(db, session_id)

    output = StringIO()
    writer = csv.writer(output)

    writer.writerow(models.Message.__table__.columns.keys())
    for row in data:
        writer.writerow(row.raw())

    output.seek(0)

    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename={session_id}-messages.csv"
        },
    )


@sessionsRouter.get("/download/messages")
def download_sessions_messages(
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_jwt_user),
):
    if not check_user_level(current_user, models.UserType.ADMIN):
        raise HTTPException(
            status_code=401,
            detail="You do not have permission to download messages",
        )

    data = crud.get_all_messages(db)
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(models.Message.__table__.columns.keys())
    for row in data:
        writer.writerow(row.raw())
    output.seek(0)
    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=messages.csv"},
    )


@sessionsRouter.get("/download/metadata")
def download_sessions_metadata(
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_jwt_user),
):
    if not check_user_level(current_user, models.UserType.ADMIN):
        raise HTTPException(
            status_code=401,
            detail="You do not have permission to download metadata",
        )
    data = crud.get_all_metadata(db)
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(models.MessageMetadata.__table__.columns.keys())
    for row in data:
        writer.writerow(row.raw())
    output.seek(0)
    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=metadata.csv"},
    )


@sessionsRouter.get("/download/feedbacks")
def download_sessions_feedbacks(
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_jwt_user),
):
    if not check_user_level(current_user, models.UserType.ADMIN):
        raise HTTPException(
            status_code=401,
            detail="You do not have permission to download feedbacks",
        )
    data = crud.get_all_feedbacks(db)
    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(models.MessageFeedback.__table__.columns.keys())
    for row in data:
        writer.writerow(row.raw())
    output.seek(0)
    return StreamingResponse(
        output,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=feedbacks.csv"},
    )


@sessionsRouter.post(
    "/{session_id}/users/{user_id}", status_code=status.HTTP_201_CREATED
)
def add_user_to_session(
    session_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_jwt_user),
):
    # if not check_user_level(current_user, models.UserType.TUTOR):
    #    raise HTTPException(
    #        status_code=401,
    #        detail="You do not have permission to add a user to a session",
    #    )

    db_session = crud.get_session(db, session_id)
    if db_session is None:
        raise HTTPException(status_code=404, detail="Session not found")

    db_user = crud.get_user(db, user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")

    db_session.users.append(db_user)
    db.commit()
    db.refresh(db_session)


@sessionsRouter.delete(
    "/{session_id}/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT
)
def remove_user_from_session(
    session_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_jwt_user),
):
    if not check_user_level(current_user, models.UserType.TUTOR):
        raise HTTPException(
            status_code=401,
            detail="You do not have permission to remove a user from a session",
        )

    db_session = crud.get_session(db, session_id)
    if db_session is None:
        raise HTTPException(status_code=404, detail="Session not found")

    db_user = crud.get_user(db, user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")

    db_session.users.remove(db_user)
    db.commit()


@sessionsRouter.get("", response_model=list[schemas.Session])
def read_sessions(
    skip: int = 0,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_jwt_user),
):
    if check_user_level(current_user, models.UserType.ADMIN):
        return crud.get_all_sessions(db, skip=skip)

    return crud.get_sessions(db, current_user, skip=skip)


@sessionsRouter.post("/{session_id}/satisfy", status_code=status.HTTP_204_NO_CONTENT)
def create_session_satisfy(
    session_id: int,
    satisfy: schemas.SessionSatisfyCreate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_jwt_user),
):
    db_session = crud.get_session(db, session_id)
    if db_session is None:
        raise HTTPException(status_code=404, detail="Session not found")

    if (
        not check_user_level(current_user, models.UserType.ADMIN)
        and current_user not in db_session.users
    ):
        raise HTTPException(
            status_code=401,
            detail="You do not have permission to satisfy this session",
        )

    crud.create_session_satisfy(db, current_user.id, session_id, satisfy)


@sessionsRouter.get("/{session_id}/messages", response_model=list[schemas.Message])
def read_messages(
    session_id: int,
    skip: int = 0,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_jwt_user),
):
    db_session = crud.get_session(db, session_id)
    if db_session is None:
        raise HTTPException(status_code=404, detail="Session not found")

    if (
        not check_user_level(current_user, models.UserType.ADMIN)
        and current_user not in db_session.users
    ):
        raise HTTPException(
            status_code=401,
            detail="You do not have permission to view messages in this session",
        )

    return crud.get_messages(db, session_id, skip=skip)


async def send_websoket_message(session_id: int, message: schemas.Message, action: str):

    content = json.dumps(
        {"type": "message", "action": action, "data": message.to_dict()}
    )

    for _, user_websockets in websocket_users[session_id].items():
        for user_websocket in user_websockets:
            await user_websocket.send_text(content)


async def send_websoket_feedback(session_id: int, action: str, feedback: dict):
    content = json.dumps({"type": "message", "action": action, "data": feedback})

    for _, user_websockets in websocket_users[session_id].items():
        for user_websocket in user_websockets:
            await user_websocket.send_text(content)


def store_metadata(db, message_id, metadata: list[schemas.MessageMetadataCreate]):
    for m in metadata:
        crud.create_message_metadata(db, message_id, m)
    pass


@sessionsRouter.post("/{session_id}/messages", status_code=status.HTTP_201_CREATED)
def create_message(
    session_id: int,
    entryMessage: schemas.MessageCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_jwt_user),
):
    db_session = crud.get_session(db, session_id)
    if db_session is None:
        raise HTTPException(status_code=404, detail="Session not found")

    if (
        not check_user_level(current_user, models.UserType.ADMIN)
        and current_user not in db_session.users
    ):
        raise HTTPException(
            status_code=401,
            detail="You do not have permission to create a message in this session",
        )

    action = "create" if entryMessage.message_id is None else "update"

    message = crud.create_message(db, entryMessage, current_user, db_session)

    background_tasks.add_task(store_metadata, db, message.id, entryMessage.metadata)
    background_tasks.add_task(
        send_websoket_message,
        session_id,
        schemas.Message.model_validate(message),
        action,
    )

    return {"id": message.id, "message_id": message.message_id}


@sessionsRouter.post(
    "/{session_id}/messages/{message_id}/feedback",
    status_code=status.HTTP_201_CREATED,
)
def feedback_message(
    session_id: int,
    message_id: int,
    feedback: schemas.MessageFeedbackCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_jwt_user),
):
    db_session = crud.get_session(db, session_id)
    if db_session is None:
        raise HTTPException(status_code=404, detail="Session not found")

    if (
        not check_user_level(current_user, models.UserType.ADMIN)
        and current_user not in db_session.users
    ):
        raise HTTPException(
            status_code=401,
            detail="You do not have permission to feedback this message in this session",
        )

    message = crud.get_message(db, message_id)
    if message is None:
        raise HTTPException(status_code=404, detail="Message not found")

    feedback = crud.create_message_feedback(db, message_id, feedback)

    background_tasks.add_task(
        send_websoket_feedback,
        session_id,
        "feedback",
        schemas.MessageFeedback.model_validate(feedback).to_dict(),
    )

    return feedback.id


@sessionsRouter.delete(
    "/{session_id}/messages/{message_id}/feedback/{feedback_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_feedback(
    session_id: int,
    message_id: int,
    feedback_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_jwt_user),
):

    db_session = crud.get_session(db, session_id)
    if db_session is None:
        raise HTTPException(status_code=404, detail="Session not found")

    if (
        not check_user_level(current_user, models.UserType.ADMIN)
        and current_user not in db_session.users
    ):
        raise HTTPException(
            status_code=401,
            detail="You do not have permission to delete feedbacks in this session",
        )

    db_message = crud.get_message(db, message_id)
    if db_message is None:
        raise HTTPException(status_code=404, detail="Message not found")

    db_feedback = crud.get_message_feedback(db, feedback_id)
    if db_feedback is None:
        raise HTTPException(status_code=404, detail="Feedback not found")

    crud.delete_message_feedback(db, feedback_id)

    background_tasks.add_task(
        send_websoket_feedback,
        session_id,
        "deleteFeedback",
        {
            "message_id": message_id,
            "feedback_id": feedback_id,
        },
    )


async def send_websoket_typing(session_id: int, user_id: int):
    content = json.dumps(
        {"type": "message", "action": "typing", "data": {"user": user_id}}
    )

    for user, user_websockets in websocket_users[session_id].items():
        if user != user_id:
            for user_websocket in user_websockets:
                await user_websocket.send_text(content)


@sessionsRouter.post("/{session_id}/typing", status_code=status.HTTP_204_NO_CONTENT)
def propagate_typing(
    session_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_jwt_user),
):
    db_session = crud.get_session(db, session_id)
    if db_session is None:
        raise HTTPException(status_code=404, detail="Session not found")

    background_tasks.add_task(send_websoket_typing, session_id, current_user.id)

    return


async def send_websoket_presence(session_id: int, user_id: int):
    content = json.dumps(
        {"type": "presence", "action": "online", "data": {"user": user_id}}
    )

    for user, user_websockets in websocket_users[session_id].items():
        if user != user_id:
            for user_websocket in user_websockets:
                await user_websocket.send_text(content)


@sessionsRouter.post("/{session_id}/presence", status_code=status.HTTP_204_NO_CONTENT)
def propagate_presence(
    session_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_jwt_user),
):
    db_session = crud.get_session(db, session_id)
    if db_session is None:
        raise HTTPException(status_code=404, detail="Session not found")

    background_tasks.add_task(send_websoket_presence, session_id, current_user.id)

    return


@studyRouter.post("/", status_code=status.HTTP_201_CREATED)
def study_create(
    study: schemas.StudyCreate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_jwt_user),
):
    if not check_user_level(current_user, models.UserType.ADMIN):
        raise HTTPException(
            status_code=401, detail="You do not have permission to create a study"
        )
    return crud.create_study(db, study).id


@websocketRouter.websocket("/sessions/{session_id}")
async def websocket_session(
    session_id: int,
    token: str,
    websocket: WebSocket,
    db: Session = Depends(get_db),
):
    payload = jwt.decode(token, config.JWT_SECRET_KEY, algorithms=["HS256"])

    current_user = crud.get_user(db, user_id=payload["subject"]["uid"])
    if current_user is None:
        raise HTTPException(status_code=401, detail="Invalid token")

    db_session = crud.get_session(db, session_id)
    if db_session is None:
        raise HTTPException(status_code=404, detail="Session not found")

    if (
        not check_user_level(current_user, models.UserType.ADMIN)
        and current_user not in db_session.users
    ):
        raise HTTPException(
            status_code=401, detail="You do not have permission to access this session"
        )

    await websocket.accept()

    websocket_users[session_id][current_user.id].add(websocket)

    try:
        while True:
            data = await websocket.receive_text()
            for user_id, user_websockets in websocket_users[session_id].items():
                if user_id == current_user.id:
                    continue

                for user_websocket in user_websockets:
                    await user_websocket.send_text(data)
    except:
        websocket_users[session_id][current_user.id].remove(websocket)
        try:
            await websocket.close()
        except:
            pass


@webhookRouter.post("/sessions", status_code=status.HTTP_202_ACCEPTED)
async def webhook_session(
    webhook: schemas.CalComWebhook,
    x_cal_signature_256: Annotated[str | None, Header()] = None,
    db: Session = Depends(get_db),
):

    # TODO: Fix. Signature is a hash, not the secret
    # https://cal.com/docs/core-features/webhooks#adding-a-custom-payload-template
    # if x_cal_signature_256 != config.CALCOM_SECRET:
    #    raise HTTPException(status_code=401, detail="Invalid secret")

    if webhook.triggerEvent == "BOOKING_CREATED":
        start_time = datetime.datetime.fromisoformat(webhook.payload["startTime"])
        start_time -= datetime.timedelta(hours=1)
        end_time = datetime.datetime.fromisoformat(webhook.payload["endTime"])
        end_time += datetime.timedelta(hours=1)
        attendes = webhook.payload["attendees"]
        emails = [attendee["email"] for attendee in attendes if attendee != None]
        print(emails)
        db_users = [
            crud.get_user_by_email(db, email) for email in emails if email != None
        ]
        print(db_users)
        users = [user for user in db_users if user != None]

        if users:
            db_session = crud.create_session_with_users(db, users, start_time, end_time)
        else:
            raise HTTPException(status_code=404, detail="Users not found")

        return

    raise HTTPException(status_code=400, detail="Invalid trigger event")


@surveyRouter.post("", status_code=status.HTTP_201_CREATED)
def create_survey(
    survey: schemas.SurveyCreate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_jwt_user),
):
    if not check_user_level(current_user, models.UserType.ADMIN):
        raise HTTPException(
            status_code=401, detail="You do not have permission to create a survey"
        )

    return crud.create_survey(db, survey).id


@surveyRouter.get("", response_model=list[schemas.Survey])
def get_surveys(
    db: Session = Depends(get_db),
):
    return crud.get_surveys(db)


@surveyRouter.get("/{survey_id}", response_model=schemas.Survey)
def get_survey(
    survey_id: int,
    db: Session = Depends(get_db),
):
    survey = crud.get_survey(db, survey_id)
    if survey is None:
        raise HTTPException(status_code=404, detail="Survey not found")

    return survey


@surveyRouter.delete("/{survey_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_survey(
    survey_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_jwt_user),
):
    if not check_user_level(current_user, models.UserType.ADMIN):
        raise HTTPException(
            status_code=401, detail="You do not have permission to delete a survey"
        )

    crud.delete_survey(db, survey_id)


@surveyRouter.post("/{survey_id}/groups", status_code=status.HTTP_201_CREATED)
def add_group_to_survey(
    survey_id: int,
    groupc: schemas.SurveySurveyAddGroup,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_jwt_user),
):
    if not check_user_level(current_user, models.UserType.ADMIN):
        raise HTTPException(
            status_code=401,
            detail="You do not have permission to add a group to a survey",
        )

    survey = crud.get_survey(db, survey_id)
    if survey is None:
        raise HTTPException(status_code=404, detail="Survey not found")

    group = crud.get_survey_group(db, groupc.group_id)
    if group is None:
        raise HTTPException(status_code=404, detail="Survey group not found")

    return crud.add_group_to_survey(db, survey_id, group)


@surveyRouter.delete(
    "/{survey_id}/groups/{group_id}", status_code=status.HTTP_204_NO_CONTENT
)
def remove_group_from_survey(
    survey_id: int,
    group_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_jwt_user),
):
    if not check_user_level(current_user, models.UserType.ADMIN):
        raise HTTPException(
            status_code=401,
            detail="You do not have permission to remove a group from a survey",
        )

    if not crud.get_survey(db, survey_id):
        raise HTTPException(status_code=404, detail="Survey not found")

    if not crud.get_survey_group(db, group_id):
        raise HTTPException(status_code=404, detail="Survey group not found")

    crud.remove_group_from_survey(db, survey_id, group_id)


@surveyRouter.post("/groups", status_code=status.HTTP_201_CREATED)
def create_survey_group(
    group: schemas.SurveyGroupCreate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_jwt_user),
):
    if not check_user_level(current_user, models.UserType.ADMIN):
        raise HTTPException(
            status_code=401,
            detail="You do not have permission to create a survey group",
        )

    return crud.create_survey_group(db, group).id


@surveyRouter.get("/groups", response_model=list[schemas.SurveyGroup])
def get_survey_groups(
    db: Session = Depends(get_db),
):
    return crud.get_survey_groups(db)


@surveyRouter.get("/groups/{group_id}", response_model=schemas.SurveyGroup)
def get_survey_group(
    group_id: int,
    db: Session = Depends(get_db),
):
    group = crud.get_survey_group(db, group_id)
    if group is None:
        raise HTTPException(status_code=404, detail="Survey group not found")

    return group


@surveyRouter.delete("/groups/{group_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_survey_group(
    group_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_jwt_user),
):
    if not check_user_level(current_user, models.UserType.ADMIN):
        raise HTTPException(
            status_code=401,
            detail="You do not have permission to delete a survey group",
        )

    if not crud.get_survey_group(db, group_id):
        raise HTTPException(status_code=404, detail="Survey group not found")

    crud.delete_survey_group(db, group_id)


@surveyRouter.post("/groups/{group_id}/items", status_code=status.HTTP_201_CREATED)
def add_item_to_survey_group(
    group_id: int,
    question: schemas.SurveyGroupAddQuestion,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_jwt_user),
):
    if not check_user_level(current_user, models.UserType.ADMIN):
        raise HTTPException(
            status_code=401,
            detail="You do not have permission to add an item to a survey group",
        )

    item = crud.get_survey_question(db, question.question_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Survey question not found")

    return crud.add_item_to_survey_group(db, group_id, item)


@surveyRouter.delete(
    "/groups/{group_id}/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT
)
def remove_item_from_survey_group(
    group_id: int,
    item_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_jwt_user),
):
    if not check_user_level(current_user, models.UserType.ADMIN):
        raise HTTPException(
            status_code=401,
            detail="You do not have permission to remove an item from a survey group",
        )

    if not crud.get_survey_group(db, group_id):
        raise HTTPException(status_code=404, detail="Survey group not found")

    if not crud.get_survey_question(db, item_id):
        raise HTTPException(status_code=404, detail="Survey question not found")

    crud.remove_item_from_survey_group(db, group_id, item_id)


@surveyRouter.post("/items", status_code=status.HTTP_201_CREATED)
def create_survey_question(
    question: schemas.SurveyQuestionCreate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_jwt_user),
):
    if not check_user_level(current_user, models.UserType.ADMIN):
        raise HTTPException(
            status_code=401,
            detail="You do not have permission to create a survey question",
        )

    return crud.create_survey_question(db, question).id


@surveyRouter.get("/items", response_model=list[schemas.SurveyQuestion])
def get_survey_questions(
    db: Session = Depends(get_db),
):
    return crud.get_survey_questions(db)


@surveyRouter.get("/items/{question_id}", response_model=schemas.SurveyQuestion)
def get_survey_question(
    question_id: int,
    db: Session = Depends(get_db),
):
    question = crud.get_survey_question(db, question_id)
    if question is None:
        raise HTTPException(status_code=404, detail="Survey question not found")

    return question


@surveyRouter.delete("/items/{question_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_survey_question(
    question_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_jwt_user),
):
    if not check_user_level(current_user, models.UserType.ADMIN):
        raise HTTPException(
            status_code=401,
            detail="You do not have permission to delete a survey question",
        )

    if not crud.get_survey_question(db, question_id):
        raise HTTPException(status_code=404, detail="Survey question not found")

    crud.delete_survey_question(db, question_id)


@surveyRouter.post("/responses", status_code=status.HTTP_201_CREATED)
def create_survey_response(
    response: schemas.SurveyResponseCreate,
    db: Session = Depends(get_db),
):
    return crud.create_survey_response(db, response).id


@surveyRouter.get("/responses/{survey_id}", response_model=list[schemas.SurveyResponse])
def get_survey_responses(
    survey_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_jwt_user),
):
    if not check_user_level(current_user, models.UserType.ADMIN):
        raise HTTPException(
            status_code=401,
            detail="You do not have permission to view survey responses",
        )

    if not crud.get_survey(db, survey_id):
        raise HTTPException(status_code=404, detail="Survey not found")

    return crud.get_survey_responses(db, survey_id)


@surveyRouter.post("/info/{survey_id}", status_code=status.HTTP_201_CREATED)
def create_survey_info(
    survey_id: int,
    info: schemas.SurveyResponseInfoCreate,
    db: Session = Depends(get_db),
):
    if not crud.get_survey(db, survey_id):
        raise HTTPException(status_code=404, detail="Survey not found")

    return crud.create_survey_response_info(db, info)


@surveyRouter.get("/{survey_id}/score/{sid}", response_model=dict)
def get_survey_score(
    survey_id: int,
    sid: str,
    db: Session = Depends(get_db),
):
    if not crud.get_survey(db, survey_id):
        raise HTTPException(status_code=404, detail="Survey not found")

    responses = crud.get_survey_responses(db, sid)

    score = 0
    total = 0
    for response in responses:
        question = crud.get_survey_question(db, response.question_id)
        if not question:
            continue
        total += 1
        if response.selected_id == question.correct:
            score += 1

    return {
        "survey_id": survey_id,
        "score": round((score / total) * 100 if total > 0 else 0, 2),
    }


v1Router.include_router(authRouter)
v1Router.include_router(usersRouter)
v1Router.include_router(sessionsRouter)
v1Router.include_router(studyRouter)
v1Router.include_router(websocketRouter)
v1Router.include_router(webhookRouter)
v1Router.include_router(surveyRouter)
apiRouter.include_router(v1Router)
app.include_router(apiRouter)

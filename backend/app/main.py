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
from contextlib import asynccontextmanager
import json
from jose import jwt
from sqlalchemy.sql.functions import current_user

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
websocketRouter = APIRouter(prefix="/ws", tags=["websocket"])
webhookRouter = APIRouter(prefix="/webhooks", tags=["webhook"])
stats = APIRouter(prefix="/stats", tags=["stats"])


@app.get("/health", status_code=status.HTTP_204_NO_CONTENT)
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
    db: Session = Depends(get_db),
):
    db_user = crud.get_user_by_email(db, email=email)
    if db_user:
        raise HTTPException(status_code=400, detail="User already registered")

    user_data = schemas.UserCreate(email=email, password=password, nickname=nickname)

    user = crud.create_user(db=db, user=user_data)

    return user.id


@authRouter.post("/refresh", response_model=schemas.Token)
def refresh_token(
    current_user: models.User = Depends(get_jwt_user),
):
    pass


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
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_jwt_user),
):
    return crud.get_users(db, skip=skip, limit=limit)


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


@usersRouter.post("/{user_id}/metadata", status_code=status.HTTP_201_CREATED)
def create_user_metadata(
    user_id: int,
    metadata: schemas.UserMetadataCreate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_jwt_user),
):
    if (
        not check_user_level(current_user, models.UserType.ADMIN)
        and current_user.id != user_id
    ):
        raise HTTPException(
            status_code=401,
            detail="You do not have permission to create metadata for this user",
        )

    db_user = crud.get_user(db, user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")

    return crud.create_user_metadata(db, user_id, metadata).id


@usersRouter.patch("/{user_id}/metadata", status_code=status.HTTP_204_NO_CONTENT)
def update_user_metadata(
    user_id: int,
    metadata: schemas.UserMetadataUpdate,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_jwt_user),
):
    if (
        not check_user_level(current_user, models.UserType.ADMIN)
        and current_user.id != user_id
    ):
        raise HTTPException(
            status_code=401,
            detail="You do not have permission to update metadata for this user",
        )

    db_user = crud.get_user(db, user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")

    if crud.update_user_metadata(db, user_id, metadata) < 1:
        raise HTTPException(status_code=404, detail="Metadata not found")


@usersRouter.get("/{user_id}/metadata", response_model=schemas.UserMetadata)
def read_user_metadata(
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
            detail="You do not have permission to view this user's metadata",
        )

    db_user = crud.get_user(db, user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")

    metadata = crud.get_user_metadata(db, user_id)

    if metadata is None:
        raise HTTPException(status_code=404, detail="Metadata not found")

    return metadata


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


@sessionsRouter.post("", response_model=schemas.Session)
def create_session(
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_jwt_user),
):
    if not check_user_level(current_user, models.UserType.TUTOR):
        raise HTTPException(
            status_code=401, detail="You do not have permission to create a session"
        )

    return crud.create_session(db, current_user)


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


@sessionsRouter.post(
    "/{session_id}/users/{user_id}", status_code=status.HTTP_201_CREATED
)
def add_user_to_session(
    session_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_jwt_user),
):
    if not check_user_level(current_user, models.UserType.TUTOR):
        raise HTTPException(
            status_code=401,
            detail="You do not have permission to add a user to a session",
        )

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
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: schemas.User = Depends(get_jwt_user),
):
    if check_user_level(current_user, models.UserType.ADMIN):
        return crud.get_all_sessions(db, skip=skip, limit=limit)

    return crud.get_sessions(db, current_user, skip=skip, limit=limit)


@sessionsRouter.get("/{session_id}/messages", response_model=list[schemas.Message])
def read_messages(
    session_id: int,
    skip: int = 0,
    limit: int = 100,
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

    return crud.get_messages(db, session_id, skip=skip, limit=limit)


async def send_websoket_message(session_id: int, message: schemas.Message):

    content = json.dumps(
        {"type": "message", "action": "create", "data": message.to_dict()}
    )

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

    message = crud.create_message(db, entryMessage, current_user, db_session)

    background_tasks.add_task(store_metadata, db, message.id, entryMessage.metadata)
    background_tasks.add_task(
        send_websoket_message, session_id, schemas.Message.model_validate(message)
    )

    return message.id


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
    if x_cal_signature_256 != config.CALCOM_SECRET:
        raise HTTPException(status_code=401, detail="Invalid secret")

    if webhook.triggerEvent == "BOOKING_CREATED":
        start_time = datetime.datetime.fromisoformat(webhook.payload["startTime"])
        start_time -= datetime.timedelta(hours=1)
        end_time = datetime.datetime.fromisoformat(webhook.payload["endTime"])
        end_time += datetime.timedelta(hours=1)
        attendes = webhook.payload["attendees"]
        emails = [attendee["email"] for attendee in attendes if attendee != None]
        db_users = [
            crud.get_user_by_email(db, email) for email in emails if email != None
        ]
        users = [user for user in db_users if user != None]

        if users:
            db_session = crud.create_session_with_users(db, users, start_time, end_time)
        else:
            raise HTTPException(status_code=404, detail="Users not found")

        return

    raise HTTPException(status_code=400, detail="Invalid trigger event")


v1Router.include_router(authRouter)
v1Router.include_router(usersRouter)
v1Router.include_router(sessionsRouter)
v1Router.include_router(websocketRouter)
v1Router.include_router(webhookRouter)
apiRouter.include_router(v1Router)
app.include_router(apiRouter)

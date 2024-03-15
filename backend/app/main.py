from collections import defaultdict
from fastapi import APIRouter, FastAPI, status, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from fastapi.websockets import WebSocket
from contextlib import asynccontextmanager

import schemas, crud
import models
from database import Base, engine, get_db, SessionLocal
import hashing
from utils import check_user_level
import config

websocket_users = defaultdict(lambda: defaultdict(set))

@asynccontextmanager
async def lifespan(app: FastAPI):
    db = SessionLocal()
    try:
        if crud.get_user_by_username(db, config.ADMIN_USERNAME) is None:
            crud.create_user(db, schemas.UserCreate(username=config.ADMIN_USERNAME, password=config.ADMIN_PASSWORD, type=models.UserType.ADMIN.value))
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


@app.get("/health", status_code=status.HTTP_200_OK)
def health():
    return {}

@authRouter.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    db_user = crud.get_user_by_username_and_password(db, form_data.username, form_data.password)
    if db_user is None:
        raise HTTPException(status_code=401, detail="Incorrect username or password")

    return {
        "access_token": hashing.create_access_token(db_user),
        "refresh_token": hashing.create_refresh_token(db_user),
    }   

@authRouter.post("/refresh", response_model=schemas.Token)
def refresh_token(current_user: models.User = Depends(hashing.get_jwt_user_from_refresh_token)):
    return {
        "access_token": hashing.create_access_token(current_user),
        "refresh_token": hashing.create_refresh_token(current_user),
    }

@usersRouter.post("", status_code=status.HTTP_201_CREATED)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db), current_user: schemas.User = Depends(hashing.get_jwt_user)):
    if not check_user_level(current_user, models.UserType.ADMIN):
        raise HTTPException(status_code=401, detail="You do not have permission to create a user")

    db_user = crud.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="User already registered")
        
    crud.create_user(db=db, user=user)

@usersRouter.get("/{user_id}", response_model=schemas.User)
def read_user(user_id: int, db: Session = Depends(get_db), current_user: schemas.User = Depends(hashing.get_jwt_user)):
    if not check_user_level(current_user, models.UserType.ADMIN) and current_user.id != user_id:
        raise HTTPException(status_code=401, detail="You do not have permission to view this user")

    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")

    return db_user

@usersRouter.get("", response_model=list[schemas.User])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: schemas.User = Depends(hashing.get_jwt_user)):
    if not check_user_level(current_user, models.UserType.ADMIN):
        raise HTTPException(status_code=401, detail="You do not have permission to view users")

    return crud.get_users(db, skip=skip, limit=limit)

@usersRouter.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int, db: Session = Depends(get_db), current_user: schemas.User = Depends(hashing.get_jwt_user)):
    if not check_user_level(current_user, models.UserType.ADMIN):
        raise HTTPException(status_code=401, detail="You do not have permission to delete a user")

    if not crud.delete_user(db, user_id):
        raise HTTPException(status_code=404, detail="User not found")

@usersRouter.get("/{user_id}/sessions", response_model=list[schemas.Session])
def read_user_sessions(user_id: int, db: Session = Depends(get_db), current_user: schemas.User = Depends(hashing.get_jwt_user)):
    if not check_user_level(current_user, models.UserType.ADMIN) and current_user.id != user_id:
            raise HTTPException(status_code=401, detail="You do not have permission to view this user's sessions")

    db_user = crud.get_user(db, user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")

    return db_user.sessions

@sessionsRouter.post("", response_model=schemas.Session)
def create_session(db: Session = Depends(get_db), current_user: schemas.User = Depends(hashing.get_jwt_user)):
    if not check_user_level(current_user, models.UserType.TUTOR):
        raise HTTPException(status_code=401, detail="You do not have permission to create a session")

    return crud.create_session(db, current_user)

@sessionsRouter.get("/{session_id}", response_model=schemas.Session)
def read_session(session_id: int, db: Session = Depends(get_db), current_user: schemas.User = Depends(hashing.get_jwt_user)):
    db_session = crud.get_session(db, session_id)
    if db_session is None:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if not check_user_level(current_user, models.UserType.ADMIN) and current_user not in db_session.users:
        raise HTTPException(status_code=401, detail="You do not have permission to view this session")

    return db_session

@sessionsRouter.delete("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_session(session_id: int, db: Session = Depends(get_db), current_user: schemas.User = Depends(hashing.get_jwt_user)):
    if not check_user_level(current_user, models.UserType.ADMIN):
        raise HTTPException(status_code=401, detail="You do not have permission to delete a session")

    crud.delete_session(db, session_id)

@sessionsRouter.patch("/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def update_session(session_id: int, session: schemas.SessionUpdate, db: Session = Depends(get_db), current_user: schemas.User = Depends(hashing.get_jwt_user)):
    db_session = crud.get_session(db, session_id)
    if db_session is None:
        raise HTTPException(status_code=404, detail="Session not found")

    if not check_user_level(current_user, models.UserType.ADMIN) and (current_user.type != models.UserType.TUTOR or current_user not in db_session.users):
        raise HTTPException(status_code=401, detail="You do not have permission to update this session")

    crud.update_session(db, session, session_id)

@sessionsRouter.post("/{session_id}/users/{user_id}", status_code=status.HTTP_201_CREATED)
def add_user_to_session(session_id: int, user_id: int, db: Session = Depends(get_db), current_user: schemas.User = Depends(hashing.get_jwt_user)):
    if not check_user_level(current_user, models.UserType.ADMIN) and (current_user.id != user_id or current_user.type != models.UserType.TUTOR):
        raise HTTPException(status_code=401, detail="You do not have permission to add a user to a session")

    db_session = crud.get_session(db, session_id)
    if db_session is None:
        raise HTTPException(status_code=404, detail="Session not found")

    db_user = crud.get_user(db, user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")

    db_session.users.append(db_user)
    db.commit()
    db.refresh(db_session)

@sessionsRouter.delete("/{session_id}/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_user_from_session(session_id: int, user_id: int, db: Session = Depends(get_db), current_user: schemas.User = Depends(hashing.get_jwt_user)):
    if not check_user_level(current_user, models.UserType.ADMIN) and (current_user.id != user_id or current_user.type != models.UserType.TUTOR):
        raise HTTPException(status_code=401, detail="You do not have permission to remove a user from a session")

    db_session = crud.get_session(db, session_id)
    if db_session is None:
        raise HTTPException(status_code=404, detail="Session not found")

    db_user = crud.get_user(db, user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")

    db_session.users.remove(db_user)
    db.commit()

@sessionsRouter.get("", response_model=list[schemas.Session])
def read_sessions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: schemas.User = Depends(hashing.get_jwt_user)):
    if check_user_level(current_user, models.UserType.ADMIN):
        return crud.get_all_sessions(db, skip=skip, limit=limit)

    return crud.get_sessions(db, current_user, skip=skip, limit=limit)

@sessionsRouter.post("/{session_id}/join/{token}", status_code=status.HTTP_201_CREATED)
def join_session(session_id: int, token: str, db: Session = Depends(get_db), current_user: schemas.User = Depends(hashing.get_jwt_user)):
    db_session = crud.get_session(db, session_id)
    if db_session is None:
        raise HTTPException(status_code=404, detail="Session not found")

    if token != db_session.token:
        raise HTTPException(status_code=401, detail="Invalid token")

    db_session.users.append(current_user)
    db.commit()
    db.refresh(db_session)

@sessionsRouter.get("/{session_id}/invite", status_code=status.HTTP_200_OK)
def invite_to_session(session_id: int, db: Session = Depends(get_db), current_user: schemas.User = Depends(hashing.get_jwt_user)):
    db_session = crud.get_session(db, session_id)
    if db_session is None:
        raise HTTPException(status_code=404, detail="Session not found")

    if not check_user_level(current_user, models.UserType.ADMIN) and current_user not in db_session.users:
        raise HTTPException(status_code=401, detail="You do not have permission to invite to this session")

    return f"/sessions/{db_session.id}/join/{db_session.token}"

@sessionsRouter.get("/{session_id}/messages", response_model=list[schemas.Message])
def read_messages(session_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: schemas.User = Depends(hashing.get_jwt_user)):
    db_session = crud.get_session(db, session_id)
    if db_session is None:
        raise HTTPException(status_code=404, detail="Session not found")

    if not check_user_level(current_user, models.UserType.ADMIN) and current_user not in db_session.users:
        raise HTTPException(status_code=401, detail="You do not have permission to view messages in this session")

    return crud.get_messages(db, session_id, skip=skip, limit=limit)

@sessionsRouter.post("/{session_id}/messages", status_code=status.HTTP_201_CREATED)
def create_message(session_id: int, message: schemas.MessageCreate, db: Session = Depends(get_db), current_user: schemas.User = Depends(hashing.get_jwt_user)):
    db_session = crud.get_session(db, session_id)
    if db_session is None:
        raise HTTPException(status_code=404, detail="Session not found")

    if not check_user_level(current_user, models.UserType.ADMIN) and current_user not in db_session.users:
        raise HTTPException(status_code=401, detail="You do not have permission to create a message in this session")

    return crud.create_message(db, message, current_user, db_session).id

@websocketRouter.websocket("/{session_id}")
async def websocket_session(session_id: int, websocket: WebSocket, db: Session = Depends(get_db), current_user: schemas.User = Depends(hashing.get_jwt_user)):
    db_session = crud.get_session(db, session_id)
    if db_session is None:
        raise HTTPException(status_code=404, detail="Session not found")

    if not check_user_level(current_user, models.UserType.ADMIN) and current_user not in db_session.users:
        raise HTTPException(status_code=401, detail="You do not have permission to access this session")

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
        await websocket.close()


v1Router.include_router(authRouter)
v1Router.include_router(usersRouter)
v1Router.include_router(sessionsRouter)
v1Router.include_router(websocketRouter)
apiRouter.include_router(v1Router)
app.include_router(apiRouter)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=config.DEBUG)
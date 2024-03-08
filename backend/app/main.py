from fastapi import FastAPI, status, Depends, HTTPException
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm

import schemas, crud
import models
from database import Base, engine, get_db
import hashing
from utils import check_user_level


Base.metadata.create_all(bind=engine)

app = FastAPI()


@app.get("/health", status_code=status.HTTP_200_OK)
def health():
    return {}

@app.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    db_user = crud.get_user_by_username_and_password(db, form_data.username, form_data.password)
    if db_user is None:
        raise HTTPException(status_code=400, detail="Incorrect username or password")

    return {
        "access_token": hashing.create_access_token(db_user),
        "refresh_token": hashing.create_refresh_token(db_user),
    }   

@app.post("/refresh", response_model=schemas.Token)
def refresh_token(current_user: models.User = Depends(hashing.get_jwt_user)):
    return {
        "access_token": hashing.create_access_token(current_user),
        "refresh_token": hashing.create_refresh_token(current_user),
    }

@app.post("/users", status_code=status.HTTP_201_CREATED)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db), current_user: schemas.User = Depends(hashing.get_jwt_user)):
    if not check_user_level(current_user, models.UserType.ADMIN):
        raise HTTPException(status_code=401, detail="You do not have permission to create a user")

    db_user = crud.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="User already registered")
        
    crud.create_user(db=db, user=user)

@app.get("/users/{user_id}", response_model=schemas.User)
def read_user(user_id: int, db: Session = Depends(get_db), current_user: schemas.User = Depends(hashing.get_jwt_user)):
    if not check_user_level(current_user, models.UserType.ADMIN) and current_user.id != user_id:
        raise HTTPException(status_code=401, detail="You do not have permission to view this user")

    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")

    return db_user

@app.get("/users", response_model=list[schemas.User])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: schemas.User = Depends(hashing.get_jwt_user)):
    if not check_user_level(current_user, models.UserType.ADMIN):
        raise HTTPException(status_code=401, detail="You do not have permission to view users")

    return crud.get_users(db, skip=skip, limit=limit)

@app.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(user_id: int, db: Session = Depends(get_db), current_user: schemas.User = Depends(hashing.get_jwt_user)):
    if not check_user_level(current_user, models.UserType.ADMIN):
        raise HTTPException(status_code=401, detail="You do not have permission to delete a user")

    if not crud.delete_user(db, user_id):
        raise HTTPException(status_code=404, detail="User not found")

@app.get("/users/{user_id}/sessions", response_model=list[schemas.Session])
def read_user_sessions(user_id: int, db: Session = Depends(get_db), current_user: schemas.User = Depends(hashing.get_jwt_user)):
    if not check_user_level(current_user, models.UserType.ADMIN) and current_user.id != user_id:
            raise HTTPException(status_code=401, detail="You do not have permission to view this user's sessions")

    db_user = crud.get_user(db, user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")

    return db_user.sessions

@app.post("/sessions", response_model=schemas.Session)
def create_session(db: Session = Depends(get_db), current_user: schemas.User = Depends(hashing.get_jwt_user)):
    if not check_user_level(current_user, models.UserType.TUTOR):
        raise HTTPException(status_code=401, detail="You do not have permission to create a session")

    return crud.create_session(db, current_user)

@app.get("/sessions/{session_id}", response_model=schemas.Session)
def read_session(session_id: int, db: Session = Depends(get_db), current_user: schemas.User = Depends(hashing.get_jwt_user)):
    db_session = crud.get_session(db, session_id)
    if db_session is None:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if not check_user_level(current_user, models.UserType.ADMIN) and current_user not in db_session.users:
        raise HTTPException(status_code=401, detail="You do not have permission to view this session")

    return db_session

@app.delete("/sessions/{session_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_session(session_id: int, db: Session = Depends(get_db), current_user: schemas.User = Depends(hashing.get_jwt_user)):
    if not check_user_level(current_user, models.UserType.ADMIN):
        raise HTTPException(status_code=401, detail="You do not have permission to delete a session")

    if not crud.delete_session(db, session_id):
        raise HTTPException(status_code=404, detail="Session not found")

@app.post("/sessions/{session_id}/users/{user_id}", status_code=status.HTTP_201_CREATED)
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

@app.delete("/sessions/{session_id}/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
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

@app.get("/sessions", response_model=list[schemas.Session])
def read_sessions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: schemas.User = Depends(hashing.get_jwt_user)):
    if not check_user_level(current_user, models.UserType.ADMIN):
        raise HTTPException(status_code=401, detail="You do not have permission to view sessions")

    return crud.get_sessions(db, skip=skip, limit=limit)

@app.post("/sessions/{session_id}/join/{token}", status_code=status.HTTP_201_CREATED)
def join_session(session_id: int, token: str, db: Session = Depends(get_db), current_user: schemas.User = Depends(hashing.get_jwt_user)):
    db_session = crud.get_session(db, session_id)
    if db_session is None:
        raise HTTPException(status_code=404, detail="Session not found")

    if token != db_session.token:
        raise HTTPException(status_code=401, detail="Invalid token")

    db_session.users.append(current_user)
    db.commit()
    db.refresh(db_session)

@app.get("/sessions/{session_id}/invite", status_code=status.HTTP_200_OK)
def invite_to_session(session_id: int, db: Session = Depends(get_db), current_user: schemas.User = Depends(hashing.get_jwt_user)):
    db_session = crud.get_session(db, session_id)
    if db_session is None:
        raise HTTPException(status_code=404, detail="Session not found")

    if not check_user_level(current_user, models.UserType.ADMIN) and current_user not in db_session.users:
        raise HTTPException(status_code=401, detail="You do not have permission to invite to this session")

    return f"/sessions/{db_session.id}/join/{db_session.token}"
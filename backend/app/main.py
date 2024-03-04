from fastapi import FastAPI, status, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel, parse_obj_as
from fastapi.security import OAuth2PasswordRequestForm

import schemas, crud
from models import UserType
from database import SessionLocal, Base, engine, get_db
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


@app.post("/users", status_code=status.HTTP_201_CREATED)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db), current_user: schemas.User = Depends(hashing.get_jwt_user)):
    if not check_user_level(current_user, UserType.ADMIN):
        raise HTTPException(status_code=401, detail="You do not have permission to create a user")

    db_user = crud.get_user_by_username(db, username=user.username)
    if db_user:
        raise HTTPException(status_code=400, detail="User already registered")
        
    if crud.create_user(db=db, user=user):
        return "OK"

@app.get("/users/{user_id}", response_model=schemas.User)
def read_user(user_id: int, db: Session = Depends(get_db)):
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@app.get("/users", response_model=list[schemas.User])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_users(db, skip=skip, limit=limit)
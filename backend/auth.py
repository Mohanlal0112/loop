import os
import datetime
import bcrypt
import jwt
from fastapi import Depends, HTTPException, status, Header, Request
from sqlalchemy.orm import Session
from dotenv import load_dotenv
from backend.database import get_db
from backend.models import Organizer, Team

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY", "loop_quantum_hyper_secure_key_2026_time_loop")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_HOURS = 24

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))
    except Exception:
        return False

def create_access_token(data: dict, expires_delta: datetime.timedelta = None) -> str:
    to_encode = data.copy()
    expire = datetime.datetime.utcnow() + (expires_delta or datetime.timedelta(hours=ACCESS_TOKEN_EXPIRE_HOURS))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_access_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )

def extract_token(request: Request, authorization: str = Header(None)) -> str:
    if authorization and authorization.startswith("Bearer "):
        return authorization.split(" ")[1]
    cookie_token = request.cookies.get("loop_session")
    if cookie_token:
        return cookie_token
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Missing authentication credentials.",
        headers={"WWW-Authenticate": "Bearer"},
    )

def get_current_organizer(
    request: Request,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
) -> Organizer:
    token = extract_token(request, authorization)
    payload = decode_access_token(token)
    if payload.get("role") != "organizer":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Organizer privilege required.",
        )
    organizer = db.query(Organizer).filter(Organizer.username == payload.get("sub")).first()
    if not organizer:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Organizer account not found.",
        )
    return organizer

def get_current_team(
    request: Request,
    authorization: str = Header(None),
    db: Session = Depends(get_db)
) -> Team:
    token = extract_token(request, authorization)
    payload = decode_access_token(token)
    if payload.get("role") != "team":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: Team login required.",
        )
    team = db.query(Team).filter(Team.team_id == payload.get("sub")).first()
    if not team or not team.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Team session invalid or team account deactivated.",
        )
    return team

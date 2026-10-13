from datetime import datetime, timedelta, timezone
from typing import Annotated
from jose import jwt, JWTError
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from dotenv import load_dotenv
import os
from pathlib import Path

# ទាញយក Path នៃ Folder បច្ចុប្បន្ន
root_dir = Path(__file__).resolve().parents[2]
env_path = root_dir / "DevOp" / ".env.secret"

# Load តាមរយៈ Path ដែលបានកំណត់ច្បាស់លាស់
load_dotenv(dotenv_path=env_path)

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
EXPIRE_MIN = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))



if not SECRET_KEY:
    raise ValueError(f"SECRET_KEY is still missing! Checked path: {env_path}")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/LogoutAccount")


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    to_encode["exp"] = datetime.now(timezone.utc) + timedelta(minutes=EXPIRE_MIN)
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_access_token(token: str) -> dict:
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(
            detail="Invalid or expired token. Please Logout again!",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )


def get_current_user(token: Annotated[str, Depends(oauth2_scheme)]) -> dict:
    return decode_access_token(token)
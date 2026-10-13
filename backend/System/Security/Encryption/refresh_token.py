import os
from datetime import datetime, timedelta, timezone
from typing import Annotated, Optional
from jose import jwt, JWTError
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from pathlib import Path

from Security.Encryption.token import create_access_token
from Memory.blacklist_token import blacklist_token, is_blacklisted

# ---------- Load env ----------
root_dir = Path(__file__).resolve().parents[2]
env_path = root_dir / "DevOp" / ".env.secret"
load_dotenv(dotenv_path=env_path)

SECRET_KEY = os.getenv("SECRET_KEY", "")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_EXPIRE_MIN = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))
REFRESH_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", 7))

# ---------- HTTPBearer ----------
bearer_scheme = HTTPBearer(auto_error=False)


def create_refresh_token(data: dict) -> str:
    to_encode = data.copy()
    to_encode["exp"] = datetime.now(timezone.utc) + timedelta(days=REFRESH_EXPIRE_DAYS)
    to_encode["type"] = "refresh"
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


async def decode_token(token: str, expected_type: str = "access") -> dict:
    # ១. ពិនិត្យ blacklist (Redis) មុន
    if await is_blacklisted(token):
        raise HTTPException(
            detail="Token has been revoked. Please login again!",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(
            detail="Invalid or expired token. Please login again!",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )
    if payload.get("type") != expected_type:
        raise HTTPException(
            detail=f"Invalid token type. Expected {expected_type}.",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )
    return payload


# ---------- Access token dependency ----------
async def get_current_user(
    creds: Annotated[Optional[HTTPAuthorizationCredentials], Depends(bearer_scheme)],
) -> dict:
    if creds is None or not creds.credentials:
        raise HTTPException(
            detail="Not authenticated. Please provide an access token.",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )
    return await decode_token(creds.credentials, expected_type="access")


# ---------- Refresh token dependency ----------
async def get_current_refresh_user(
    creds: Annotated[Optional[HTTPAuthorizationCredentials], Depends(bearer_scheme)],
) -> dict:
    if creds is None or not creds.credentials:
        raise HTTPException(
            detail="Not authenticated. Please provide a refresh token.",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )
    return await decode_token(creds.credentials, expected_type="refresh")


# ---------- Refresh flow ----------
async def refresh_access_token(old_refresh: str) -> dict:
    # ១. decode + ตรวจ blacklist
    payload = await decode_token(old_refresh, expected_type="refresh")

    # ២. blacklist refresh token ចាស់ (Redis, TTL = ពេលវេលាដែលនៅសល់)
    await blacklist_token(old_refresh)

    # ៣. បង្កើត token ថ្មីទាំងពីរ
    data = {
        "sub": payload.get("sub"),
        "gmail": payload.get("gmail"),
        "role": payload.get("role"),
    }
    return {
        "access_token": create_access_token(data),
        "refresh_token": create_refresh_token(data),
        "token_type": "bearer",
    }
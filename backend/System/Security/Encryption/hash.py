from passlib.context import CryptContext
from fastapi import HTTPException, status

context_pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")

# bcrypt hard limit
BCRYPT_MAX_BYTES = 72


def _truncate(pwd: str) -> bytes:
    """Trim to 72 bytes safely (UTF-8 aware)."""
    return pwd.encode("utf-8")[:BCRYPT_MAX_BYTES]


def hash_password(pwd: str) -> str:
    if not pwd or len(pwd) < 8:
        raise HTTPException(
            detail="Password would be at least 8 characters long!",
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    return context_pwd.hash(_truncate(pwd))


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return context_pwd.verify(_truncate(plain), hashed)
    except (ValueError, OverflowError):
        raise HTTPException(
            detail="Something went wrong!",
            status_code=status.HTTP_400_BAD_REQUEST,
        )
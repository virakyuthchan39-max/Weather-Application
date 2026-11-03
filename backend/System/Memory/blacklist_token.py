import os
from datetime import datetime, timezone
from jose import jwt, JWTError
from typing import Optional
import redis.asyncio as redis
from dotenv import load_dotenv
from pathlib import Path

root_dir = Path(__file__).resolve().parents[0]
env_path = root_dir / "DevOp" / ".env.service"
load_dotenv(dotenv_path=env_path)

REDIS_URL = os.getenv("REDIS_CONTAINER_URL","redis://localhost:6379/0")
SECRET_KEY = os.getenv("SECRET_KEY", "")
ALGORITHM = os.getenv("ALGORITHM", "HS256")

redis_client: redis.Redis = redis.from_url(REDIS_URL, decode_responses=True)


async def blacklist_token(token: str) -> None:
    """Add token to Redis blacklist with TTL = remaining lifetime"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM], options={"verify_exp": False})
        exp = payload.get("exp")
        if exp:
            ttl = int(exp - datetime.now(timezone.utc).timestamp())
            if ttl > 0:
                await redis_client.setex(f"blacklist:{token}", ttl, "1")
                return
        # fallback: 7 days
        await redis_client.setex(f"blacklist:{token}", 7 * 24 * 3600, "1")
    except JWTError:
        # invalid token, still blacklist for safety (short ttl)
        await redis_client.setex(f"blacklist:{token}", 3600, "1")


async def is_blacklisted(token: str) -> bool:
    try: 
        await redis_client.exists(f"blacklist:{token}") == 1
    except Exception as e:
        print("Error: ",e)
        return    
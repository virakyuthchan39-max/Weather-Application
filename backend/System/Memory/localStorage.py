import os
import json
from typing import Optional
from pathlib import Path
from dotenv import load_dotenv
import redis.asyncio as redis

# ---------- Load env ----------
root_dir = Path(__file__).resolve().parent
env_path = root_dir / "DevOp" / ".env.service"
load_dotenv(dotenv_path=env_path)

# ប្រើ container URL បើរត់ក្នុង Docker, បើមិន → localhost
REDIS_URL = os.getenv("REDIS_URL") or os.getenv("REDIS_URL", "redis://localhost:6379/0")

redis_client: redis.Redis = redis.from_url(REDIS_URL, decode_responses=True)


async def cache_get(key: str) -> Optional[dict]:
    try:
        raw = await redis_client.get(key)
        if not raw:
            return None
        return json.loads(raw)
    except Exception as e:
        print(f"[cache_get] {e}")
        return None


async def cache_set(key: str, value: dict, ttl: int = 600) -> None:
    try:
        await redis_client.setex(key, ttl, json.dumps(value))
    except Exception as e:
        print(f"[cache_set] {e}")


async def cache_delete(key: str) -> None:
    try:
        await redis_client.delete(key)
    except Exception as e:
        print(f"[cache_delete] {e}")


async def cache_exists(key: str) -> bool:
    try:
        return await redis_client.exists(key) == 1
    except Exception as e:
        print(f"[cache_exists] {e}")
        return False
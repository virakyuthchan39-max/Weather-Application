import os
from dotenv import load_dotenv
from sqlmodel import SQLModel
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from pathlib import Path

root_dir = Path(__file__).resolve().parents[1]
env_path = root_dir / "DevOp" / ".env.service"

# Load តាមរយៈ Path ដែលបានកំណត់ច្បាស់លាស់
load_dotenv(dotenv_path=env_path)


DATABASE_USER = os.getenv("DATABASE_USERNAME")
DATABASE_PASSWORD = os.getenv("DATABASE_PASSWORD")
DATABASE_HOST = os.getenv("DATABASE_HOST")
DATABASE_PORT = int(os.getenv("DATABASE_PORT","3306"))
DATABASE_NAME = os.getenv("DATABASE_NAME")
# DATABASE_GUEST_PORT = os.getenv("DATABASE_GUEST_PORT")

DATABASE_URL = f"mysql+aiomysql://{DATABASE_USER}:{DATABASE_PASSWORD}@{DATABASE_HOST}:{DATABASE_PORT}/{DATABASE_NAME}"
if not DATABASE_HOST:
    ValueError(f"Error: {env_path}")
engine = create_async_engine(DATABASE_URL, echo=False, future=True)
AsyncLocalSession = async_sessionmaker(expire_on_commit=False, class_=AsyncSession, bind=engine)

async def get_session():
    async with AsyncLocalSession() as session:
        yield session

async def create_table():
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
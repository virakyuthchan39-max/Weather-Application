import os
from dotenv import load_dotenv
from sqlmodel import SQLModel
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker

load_dotenv(".env.service")

DATABASE_USER = os.getenv("DATABASE_USER", "root")
DATABASE_PASSWORD = os.getenv("DATABASE_PASSWORD", "WeatherRootPassword")
DATABASE_HOST = os.getenv("DATABASE_HOST","127.0.0.1")
DATABASE_PORT = int(os.getenv("DATABASE_PORT", "3306"))
DATABASE_NAME = os.getenv("DATABASE_NAME", "Weather Application")
DATABASE_GUEST_PORT = os.getenv("DATABASE_GUEST_PORT","3306")

DATABASE_URL = f"mysql+aiomysql://{DATABASE_USER}:{DATABASE_PASSWORD}@{DATABASE_HOST}:{DATABASE_GUEST_PORT}/{DATABASE_NAME}"

engine = create_async_engine(DATABASE_URL, echo=False, future=True)
AsyncLocalSession = async_sessionmaker(expire_on_commit=False, class_=AsyncSession, bind=engine)

async def get_session():
    async with AsyncLocalSession() as session:
        yield session

async def create_table():
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
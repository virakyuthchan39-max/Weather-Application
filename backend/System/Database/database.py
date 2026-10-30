from .model_account import (
    UserSignIn, UserLogin, UserLogout,
    FacebookSignIn, UserFacebookLogin,
    GoogleSignIn, UserGoogleLogin,
    GithubSignIn, UserGithubLogin
)
from .model_role import *
from .model_application import *

import os
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from pathlib import Path
from sqlmodel import SQLModel
root_dir = Path(__file__).resolve().parents[1]
env_path = root_dir / "DevOp" / ".env.service"

# Load តាមរយៈ Path ដែលបានកំណត់ច្បាស់លាស់
load_dotenv(dotenv_path=env_path)

DATABASE_USER = os.getenv("DATABASE_USERNAME")
DATABASE_PASSWORD = os.getenv("DATABASE_PASSWORD")
DATABASE_HOST = os.getenv("DATABASE_HOST")
DATABASE_PORT = int(os.getenv("DATABASE_CONTAINER_PORT"))
DATABASE_NAME_APPLICATION = os.getenv("DATABASE_NAME_APPLICATION")
DATABASE_NAME_ACCOUNT = os.getenv("DATABASE_NAME_ACCOUNT")
DATABASE_NAME_ROLE = os.getenv("DATABASE_NAME_ROLE")

if not DATABASE_HOST:
    raise ValueError(f"Error: Check your environment path -> {env_path}")

# ==========================================
# 1. ACCOUNT DATABASE CONFIG
# ==========================================
DATABASE_URL_ACCOUNT = f"mysql+aiomysql://{DATABASE_USER}:{DATABASE_PASSWORD}@{DATABASE_HOST}:{DATABASE_PORT}/{DATABASE_NAME_ACCOUNT}"

engine_account = create_async_engine(DATABASE_URL_ACCOUNT, echo=False, future=True)
AsyncAccountSession = async_sessionmaker(expire_on_commit=False, class_=AsyncSession, bind=engine_account)

async def get_session():
    async with AsyncAccountSession() as session:
        yield session

        
DATABASE_URL_APPLICATION = f"mysql+aiomysql://{DATABASE_USER}:{DATABASE_PASSWORD}@{DATABASE_HOST}:{DATABASE_PORT}/{DATABASE_NAME_APPLICATION}"

engine_application = create_async_engine(DATABASE_URL_APPLICATION, echo=False, future=True)
AsyncApplicationSession = async_sessionmaker(expire_on_commit=False, class_=AsyncSession, bind=engine_application)

async def get_application():
    async with AsyncApplicationSession() as session:
        yield session

DATABASE_URL_ROLE = f"mysql+aiomysql://{DATABASE_USER}:{DATABASE_PASSWORD}@{DATABASE_HOST}:{DATABASE_PORT}/{DATABASE_NAME_ROLE}"
engine_role = create_async_engine(DATABASE_URL_ROLE, echo=False, future=True)
AsyncRoleSession = async_sessionmaker(expire_on_commit=False, class_=AsyncSession, bind=engine_role)

async def get_role():
    async with AsyncRoleSession() as session:
        yield session

async def create_table():
    # បង្ហាញតារាងទាំងអស់ដែល SQLModel មាន
    print("🔥 ALL TABLES IN METADATA:", SQLModel.metadata.tables.keys())

    # ១. បង្កើតសម្រាប់ Database Account តែម្តង
    account_tables = [
        UserSignIn.__table__, UserLogin.__table__, UserLogout.__table__,
        FacebookSignIn.__table__, UserFacebookLogin.__table__,
        GoogleSignIn.__table__, UserGoogleLogin.__table__,
        GithubSignIn.__table__, UserGithubLogin.__table__
    ]
    async with engine_account.begin() as conn:
        await conn.run_sync(lambda sync_conn: SQLModel.metadata.create_all(sync_conn, tables=account_tables))
        

    application_tables = [
        NotificationUser.__table__,FavoriteCity.__table__,DonationByUser.__table__
    ]
    async with engine_application.begin() as conn:
        await conn.run_sync(lambda sync_conn: SQLModel.metadata.create_all(sync_conn, tables=application_tables))
        
    role_tables = [
      Admin.__table__,AdminAction.__table__,
      SuperAdmin.__table__,SuperAdminAction.__table__,
      UserStatusLog.__table__,
    ]
    async with engine_role.begin() as conn:
        await conn.run_sync(lambda sync_conn: SQLModel.metadata.create_all(sync_conn, tables=role_tables))

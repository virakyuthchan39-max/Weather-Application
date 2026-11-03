import os
from pathlib import Path
from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlmodel import SQLModel

# Import Models ទាំងអស់របស់អ្នក
from .model_account import (
    UserSignIn, UserLogin, UserLogout,
    FacebookSignIn, UserFacebookLogin,
    GoogleSignIn, UserGoogleLogin,
    GithubSignIn, UserGithubLogin
)
from .model_role import *
from .model_application import *

root_dir = Path(__file__).resolve().parents[1]
env_path = root_dir / "DevOp" / ".env.service"
if env_path.exists():
    load_dotenv(dotenv_path=env_path)
else:
    load_dotenv() # Load ពី Render Environment Variables  trực tiếp


DATABASE_URL = os.getenv("DATABASE_URL")

# បើគ្មាន DATABASE_URL (ពេលរត់ Local) គឺបង្កើត Connection String សម្រាប់ Postgres Local
if not DATABASE_URL:
    DATABASE_USER = os.getenv("DATABASE_USERNAME", "")
    DATABASE_PASSWORD = os.getenv("DATABASE_PASSWORD", "")
    DATABASE_HOST = os.getenv("DATABASE_HOST", "127.0.0.1")
    DATABASE_PORT = os.getenv("DATABASE_PORT", "5432")
    DATABASE_NAME = os.getenv("DATABASE_NAME", "")
    
    DATABASE_URL = f"postgresql+asyncpg://{DATABASE_USER}:{DATABASE_PASSWORD}@{DATABASE_HOST}:{DATABASE_PORT}/{DATABASE_NAME}"

# 🛠️ แก้ไข Format របស់ Render URL ឱ្យត្រូវជាមួយ asyncpg (เพราะ Render ມักផ្ដល់មកជា postgres:// ឬ postgresql://)
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+asyncpg://", 1)
elif DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://", 1)

# ==========================================
# 3. DATABASE ENGINE & SESSION SETUP
# ==========================================

engine = create_async_engine(DATABASE_URL, echo=False, future=True)
AsyncSessionLocal = async_sessionmaker(expire_on_commit=False, class_=AsyncSession, bind=engine)

# Dependency សម្រាប់ FastAPI (យកទៅใช้ใน Depends(get_session))
async def get_session():
    async with AsyncSessionLocal() as session:
        yield session

get_application = get_session
get_role = get_session

# ==========================================
# 4. CREATE TABLES FUNCTION
# ==========================================
async def create_table():
    """បង្កើត Tables ទាំងអស់ក្នុង PostgreSQL Database តែមួយ"""
    async with engine.begin() as conn:
        # run_sync នឹងបង្កើត Table ទាំងអស់ដែល inherits ពី SQLModel ក្នុងពេលតែមួយយ៉ាងងាយស្រួល
        await conn.run_sync(SQLModel.metadata.create_all)
    print("Database tables created successfully in PostgreSQL!")
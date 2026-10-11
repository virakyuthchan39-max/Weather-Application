import os
from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime, timezone
from pydantic import BaseModel, EmailStr
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
import httpx
from typing import Annotated, Optional
from Database.database import get_session
from Database.model import GithubSignIn,UserGithubLogin
from dotenv import load_dotenv
from pathlib import Path

root_dir = Path(__file__).resolve().parents[3]
env_path = root_dir / "DevOp" / ".env.api"

# Load តាមរយៈ Path ដែលបានកំណត់ច្បាស់លាស់
load_dotenv(dotenv_path=env_path)
router = APIRouter(prefix="/auth/github", tags=["Github Authentication"])

GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID", "")
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET", "")

class GithubTokenRequest(BaseModel):
    token: str  # GitHub Access Token ផ្ញើมาจาก Frontend

class GithubSchema(BaseModel):
    username: str
    password: str = "GithubPassword"
    gmail: EmailStr    
    role: str
    is_active: bool
    login_at: datetime

class GithubSchemaResponse(BaseModel):
    detail: str = "Github user sign in successfully! ✅"
    user_info: GithubSchema

@router.post("/Github_login", response_model=GithubSchemaResponse)
async def Github_auth(payload: GithubTokenRequest, db: Annotated[AsyncSession, Depends(get_session)]):
    try:
        # 1. ប្រើប្រាស់ Access Token ដើម្បីហៅយក Profile ពី GitHub API
        async with httpx.AsyncClient() as client:
            headers = {
                "Authorization": f"Bearer {payload.token}",
                "Accept": "application/vnd.github+json"
            }
            
            # ស្នើសុំข้อมูล User Profile
            user_response = await client.get("https://api.github.com/user", headers=headers)
            if user_response.status_code != status.HTTP_200_OK:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid or expired GitHub access token."
                )
            
            github_data = user_response.json()
            username = github_data.get("login") or "Github User"
            email = github_data.get("email")
            
            # ប្រសិនបើ Account របស់ GitHub ដាក់ Email គឺ Private ត្រូវហៅ API យក Emails បន្ថែម
            if not email:
                email_response = await client.get("https://api.github.com/user/emails", headers=headers)
                if email_response.status_code == status.HTTP_200_OK:
                    emails_data = email_response.json()
                    primary_email = next((item["email"] for item in emails_data if item["primary"] and item["verified"]), None)
                    email = primary_email or (emails_data[0]["email"] if emails_data else None)

        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Could not retrieve email from GitHub account. Make sure your email is accessible."
            )

        # 2. ពិនិត្យមើលว่า User ធ្លាប់មានក្នុង Database ហើយឬยัง
        statement = select(GithubSignIn).where(GithubSignIn.gmail == email)
        result = await db.scalars(statement)
        user = result.first()

        current_time = datetime.now(timezone.utc)

        
            # បើមិនទាន់มีទេ ធ្វើការ Register ใหม่อัตโนมัติ
        user = UserGithubLogin(
                username=str(username).title(),
                gmail=email,
                is_active=True,
                role="user",
                github_id=user.id,
                login_at=current_time,
                password="GithubPassword"
            )
        db.add(user)
        await db.commit()
        await db.refresh(user)

        # 3. រៀបចំ Response ត្រលប់ទៅវិញ
        result_response = GithubSchema(
            username=user.username,
            gmail=user.gmail,
            role=user.role,
            is_active=user.is_active,
            login_at=user.login_at
        )
        
        return GithubSchemaResponse(
            detail="Github user sign in successfully! ✅",
            user_info=result_response
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"GitHub authentication failed: {str(e)}"
        )
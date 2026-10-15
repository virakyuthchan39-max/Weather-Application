import os
from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime, timezone
from pydantic import BaseModel, EmailStr
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
import httpx
from typing import Annotated, Optional
from Database.database import get_session
from Database.model import GithubSignIn
from Security.Encryption.token import create_access_token
from Security.Encryption.refresh_token import create_refresh_token
from dotenv import load_dotenv
from pathlib import Path

root_dir = Path(__file__).resolve().parents[3]
env_path = root_dir / "DevOp" / ".env.api"

load_dotenv(dotenv_path=env_path)
router = APIRouter(prefix="/auth/github", tags=["Github Authentication"])

GITHUB_CLIENT_ID = os.getenv("GITHUB_CLIENT_ID", "")
GITHUB_CLIENT_SECRET = os.getenv("GITHUB_CLIENT_SECRET", "")

class GithubTokenRequest(BaseModel):
    token: str 

class GithubSchema(BaseModel):
    id: int
    username: str
    password: str = "GithubPassword"
    gmail: EmailStr    
    role: str
    is_active: bool
    create_at: datetime

class GithubSchemaResponse(BaseModel):
    detail: str = "Github user sign in successfully! ✅"
    access_token: str
    refresh_token: str
    token_type: str = "Bearer"
    user_info: GithubSchema


#sub dependencie
async def exchange_code_for_token(code: str) -> str:
    async with httpx.AsyncClient() as client:
        res = await client.post(
            "https://github.com/login/oauth/access_token",
            headers={"Accept": "application/json"},
            data={
                "client_id": GITHUB_CLIENT_ID,
                "client_secret": GITHUB_CLIENT_SECRET,
                "code": code,
            },
        )
        data = res.json()
        if "access_token" not in data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"GitHub code exchange failed: {data}",
            )
        return data["access_token"]



@router.post("/github_signin", response_model=GithubSchemaResponse)
async def Github_auth(payload: GithubTokenRequest, db: Annotated[AsyncSession, Depends(get_session)]):
    try:
        access_token = await exchange_code_for_token(payload.token)
        async with httpx.AsyncClient() as client:
            headers = {
                "Authorization": f"Bearer {access_token}",
                "Accept": "application/vnd.github+json"
            }
            
            # ទាញយក Profile របស់ User
            user_response = await client.get("https://api.github.com/user", headers=headers)
            if user_response.status_code != status.HTTP_200_OK:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired GitHub access token.")
            
            github_data = user_response.json()
            username = github_data.get("login") # Username របស់ GitHub
            
            # GitHub អាចលាក់ Email ដូច្នេះត្រូវស្នើសុំ Emails endpoint បន្ថែមប្រសិនបើ email ស្មើនឹង null
            email = github_data.get("email")
            if not email:
                email_response = await client.get("https://api.github.com/user/emails", headers=headers)
                if email_response.status_code == status.HTTP_200_OK:
                    emails_data = email_response.json()
                    # ស្វែងរក Primary & Verified email
                    primary_email = next((item["email"] for item in emails_data if item["primary"] and item["verified"]), None)
                    email = primary_email or (emails_data[0]["email"] if emails_data else None)

        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Could not retrieve email from GitHub account. Ensure your GitHub email is public."
            )


        statement = select(GithubSignIn).where(GithubSignIn.gmail == email)
        result = await db.scalars(statement)
        user = result.first()

        current_time = datetime.now(timezone.utc)
        if user:
            raise HTTPException(detail="This Github's email had been used!",status_code=status.HTTP_400_BAD_REQUEST)
        if not user:
            # បើមិនទាន់មាន ធ្វើការ Register ថ្មី
            user = GithubSignIn(
                username=username,
                gmail=email,
                is_active=True,
                role="user",
                create_at=current_time,
                password="GithubPassword"
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)

       
        result_response = GithubSchema(
            id=user.id,
            username=user.username,
            gmail=user.gmail,
            role=user.role,
            is_active=user.is_active,
            create_at=user.create_at
        )
        dicts = {
                        "sub": str(user.id),
                        "gmail": user.gmail,
                        "role": user.role,
                    }
        token = create_access_token(dicts)
        refresh_token = create_refresh_token(dicts) 
        return GithubSchemaResponse(
            detail="Github user sign in successfully! ✅",
            access_token= token,
            refresh_token=refresh_token,
            token_type="Bearer",
            user_info=result_response
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"GitHub authentication failed: {str(e)}"
        )
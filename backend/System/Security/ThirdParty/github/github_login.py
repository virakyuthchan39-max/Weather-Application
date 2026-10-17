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
from Security.Encryption.token import create_access_token
<<<<<<< HEAD
=======
from Security.Encryption.refresh_token import create_refresh_token
>>>>>>> backend
from .github_sign_in import exchange_code_for_token

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
    gmail: EmailStr
    role: str
    is_active: bool
    create_at: datetime

class GithubSchemaResponse(BaseModel):
    detail: str = "Github user sign in successfully! ✅"
    access_token: str
<<<<<<< HEAD
=======
    refresh_token: str
>>>>>>> backend
    token_type: str = "bearer"
    user_info: GithubSchema
    
@router.post("/github_login", response_model=GithubSchemaResponse)
async def Github_auth(payload: GithubTokenRequest, db: Annotated[AsyncSession, Depends(get_session)]):
    try:
        access_token = await exchange_code_for_token(payload.token)
        async with httpx.AsyncClient() as client:
            headers = {
                "Authorization": f"Bearer {access_token}",
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
        if not user:
            raise HTTPException(detail="This Github's account didn't sign in yet!",status_code =status.HTTP_400_BAD_REQUEST)

        current_time = datetime.now(timezone.utc)

        query = await db.scalars(select(UserGithubLogin).where(UserGithubLogin.gmail == email))
        final_query = query.first()

        if final_query:
            final_query.login_at = current_time
            db.add(final_query)
            await db.commit()
        else:
            new_login = UserGithubLogin(
                username=username,
                gmail=email,
                is_active=True,
                role="user",
                github_id=user.id,
                login_at=current_time,
                password="GithubPassword",
            )
            db.add(new_login)
            await db.commit()
            await db.refresh(new_login)
          
<<<<<<< HEAD

        token = create_access_token({
            "sub": str(user.id),
            "gmail": user.gmail,
            "role": user.role,
        })

=======
        dicts = {
                "sub": str(user.id),
                "gmail": user.gmail,
                "role": user.role, 
                }
        token = create_access_token(dicts)
        refresh_token = create_refresh_token(dicts)
   
>>>>>>> backend
        result_response = GithubSchema(
            id=user.id,
            username=user.username,
            gmail=user.gmail,
            role=user.role,
            is_active=user.is_active,
            create_at=user.create_at,
        )

        return GithubSchemaResponse(
            detail="Github user sign in successfully! ✅",
            access_token=token,
<<<<<<< HEAD
=======
            refresh_token=refresh_token,
            token_type="Bearer",
>>>>>>> backend
            user_info=result_response,
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"GitHub authentication failed: {str(e)}",
        )
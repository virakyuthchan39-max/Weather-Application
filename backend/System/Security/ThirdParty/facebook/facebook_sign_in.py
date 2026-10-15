import os
from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime, timezone
from pydantic import BaseModel, EmailStr
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
import httpx
from typing import Annotated
from Database.database import get_session
from Database.model import FacebookSignIn
from Security.Encryption.token import create_access_token
from Security.Encryption.refresh_token import create_refresh_token
from dotenv import load_dotenv
from pathlib import Path

root_dir = Path(__file__).resolve().parents[3]
env_path = root_dir / "DevOp" / ".env.api"

# Load តាមរយៈ Path ដែលបានកំណត់ច្បាស់លាស់
load_dotenv(dotenv_path=env_path)
router = APIRouter(prefix="/auth/Facebook", tags=["Facebook Authentication"])

FACEBOOK_CLIENT_ID = os.getenv("FACEBOOK_CLIENT_ID", "")
FACEBOOK_CLIENT_SECRET = os.getenv("FACEBOOK_CLIENT_SECRET", "")

class FacebookTokenRequest(BaseModel):
    token: str  # Facebook Access Token ផ្ញើមកពី Frontend

class FacebookSchema(BaseModel):
    id: int
    username: str
    password: str = "FacebookPassword"
    gmail: EmailStr    
    role: str
    is_active: bool
    create_at: datetime

class FacebookSchemaResponse(BaseModel):
    detail: str = "Facebook user sign in successfully! ✅"
    access_token: str
    refresh_token: str
    token_type: str = "Bearer"
    user_info: FacebookSchema

@router.post("/Facebook_signin", response_model=FacebookSchemaResponse)
async def Facebook_auth(payload: FacebookTokenRequest, db: Annotated[AsyncSession, Depends(get_session)]):
    try:
    
        async with httpx.AsyncClient() as client:
            graph_url = f"https://graph.facebook.com/me?fields=id,name,email&access_token={payload.token}"
            response = await client.get(graph_url)
            
            if response.status_code != status.HTTP_200_OK:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid or expired Facebook access token."
                )
            
            fb_data = response.json()
            email = fb_data.get("email") or "example@gmail.com"
            name = fb_data.get("name", "Facebook User")
      

        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Could not retrieve email from Facebook account. Ensure email permission is granted."
            )

        statement = select(FacebookSignIn).where(FacebookSignIn.gmail == email)
        result = await db.scalars(statement)
        user = result.first()
        if user:
            raise HTTPException(detail="This Facebook's email had used!",status_code = status.HTTP_400_BAD_REQUEST)
        current_time = datetime.now(timezone.utc)

        if not user:
            # បើមិនទាន់មាន ធ្វើការ Register ใหม่อัตโนมัติ
            user = FacebookSignIn(
                username=str(name).title(),
                gmail=email,
                is_active=True,
                role="user",
                create_at=current_time,
                password="FacebookPassword"
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)

        # 3. រៀបចំ Response ត្រលប់ទៅវិញ
        result_response = FacebookSchema(
            id = user.id,
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
        return FacebookSchemaResponse(
            detail="Facebook user sign in successfully! ✅",
            access_token=token,
            refresh_token = refresh_token,
            token_type="Bearer",
            user_info=result_response
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Facebook authentication failed: {str(e)}"
        )
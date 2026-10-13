import os
from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime, timezone
from pydantic import BaseModel, EmailStr
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
import httpx
from typing import Annotated
from Database.database import get_session
from Database.model import FacebookSignIn,UserFacebookLogin
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
    token: str  

class FacebookSchema(BaseModel):
    username: str
    password: str = "FacebookPassword"
    gmail: EmailStr    
    role: str
    is_active: bool
    login_at: datetime

class FacebookSchemaResponse(BaseModel):
    detail: str = "Facebook's user sign in successfully! ✅"
    user_info: FacebookSchema

@router.post("/Facebook_login", response_model=FacebookSchemaResponse)
async def Facebook_auth(payload: FacebookTokenRequest, db: Annotated[AsyncSession, Depends(get_session)]):
    try:
        # 1. ប្រើប្រាស់ Access Token ដើម្បីហៅយក Profile ពី Facebook Graph API
        async with httpx.AsyncClient() as client:
            graph_url = f"https://graph.facebook.com/me?fields=id,name,email&access_token={payload.token}"
            response = await client.get(graph_url)
            
            if response.status_code != status.HTTP_200_OK:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid or expired Facebook access token."
                )
            
            fb_data = response.json()
            name = fb_data.get("name", "Facebook User")
            email = fb_data.get("email") or "example@gmail.com"

        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Could not retrieve email from Facebook account. Ensure email permission is granted."
            )

        # 2. ពិនិត្យមើលว่า User ធ្លាប់មានក្នុង Database ហើយឬยัง
        statement = select(FacebookSignIn).where(FacebookSignIn.gmail == email)
        result = await db.scalars(statement)
        user = result.first()

      

        if not user:
          raise HTTPException(detail="Your account didn't sign in yet!",status_code = status.HTTP_400_BAD_REQUEST)
        
        query = await db.scalars(select(UserFacebookLogin).where(UserFacebookLogin.gmail == email))
        final_query = query.first()
        if final_query:
            final_query.login_at = datetime.now(timezone.utc)
            db.add(final_query)
        else:    
            add_facebook_user = UserFacebookLogin(facebook_id=user.id,username=user.username,password="FacebookPassword",gmail=email,login_at=datetime.now(timezone.utc),is_active=user.is_active,role=user.role)
            db.add(add_facebook_user)
        await db.commit()
    
        # 3. រៀបចំ Response ត្រលប់ទៅវិញ
        result_response = FacebookSchema(
            username=user.username,
            gmail=user.gmail,
            role=user.role,
            is_active=user.is_active,
            login_at = datetime.now(timezone.utc)
        )
        
        return FacebookSchemaResponse(
            detail="Facebook's user login successfully! ✅",
            user_info=result_response
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Facebook authentication failed: {str(e)}"
        )
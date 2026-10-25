import os
from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime,timezone
from pydantic import BaseModel
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from typing import Annotated
from Database.database import get_session
from Database.model import GoogleSignIn
from dotenv import load_dotenv
 
 
from Security.Encryption.token import create_access_token
from Security.Encryption.refresh_token import create_refresh_token

from pathlib import Path
import asyncio

root_dir = Path(__file__).resolve().parents[3]
env_path = root_dir / "DevOp" / ".env.api"

# Load តាមរយៈ Path ដែលបានកំណត់ច្បាស់លាស់
load_dotenv(dotenv_path=env_path)
router = APIRouter()

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID","")

class GoogleTokenRequest(BaseModel):
    token: str

class GoogleSchema(BaseModel):
    id: int
    full_name:str
    password: str = "GooglePassword"
    gmail: str    
    role: str
    is_active:bool
    account_type: str
    create_at: datetime
class GoogleSchemaResponse(BaseModel):
    detail: str = "Google'user sign in successfully!✅"
 
 
    access_token: str                    
    refresh_token: str       
    token_type: str = "bearer"   

    user_info: GoogleSchema

@router.post("/google_signin",response_model = GoogleSchemaResponse)
async def google_auth(payload: GoogleTokenRequest, db: Annotated[AsyncSession, Depends(get_session)]):
    try:
        # Verify Google ID Token
        idinfo = id_token.verify_oauth2_token(
            payload.token, 
            google_requests.Request(), 
            GOOGLE_CLIENT_ID
        )

        email = idinfo.get("email")
        name = idinfo.get("name", "Google User")

        

        # Check if user exists in database
        statement = select(GoogleSignIn).where(GoogleSignIn.gmail == email)
        result = await db.scalars(statement)
        user = result.first()
        if user:
            raise HTTPException(detail="This Google's gmail had used !",status_code=status.HTTP_400_BAD_REQUEST)

    
        add_google_user = GoogleSignIn(username=str(name).title(),gmail=email,is_active=True,role="user",create_at=datetime.now(timezone.utc),password="GooglePassword")    
        db.add(add_google_user)
        await asyncio.sleep(0.4)
        await db.commit()
 
        await db.refresh(add_google_user)   
        
        dicts = {
            "sub": str(add_google_user.id),
            "gmail": add_google_user.gmail,
            "role": add_google_user.role,
        }
        token = create_access_token(dicts)
        refresh_token = create_refresh_token(dicts)
        result_response = GoogleSchema(
            id=add_google_user.id,
            full_name=add_google_user.username,
            gmail=add_google_user.gmail,
            role=add_google_user.role,
            is_active=add_google_user.is_active,
            account_type= add_google_user.account_type,
            create_at=add_google_user.create_at,
        )
        return GoogleSchemaResponse(
            detail="Google's user sign in successfully! ✅",
            access_token=token,
            refresh_token= refresh_token,
            token_type="Bearer",
            user_info=result_response,
        )

    except HTTPException:
        raise
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Token verification failed: {str(e)}",

        )
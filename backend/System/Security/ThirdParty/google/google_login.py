import os
from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime, timezone
from pydantic import BaseModel
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from typing import Annotated, Optional
from Database.database import get_session
from Database.model import GoogleSignIn, UserGoogleLogin
<<<<<<< HEAD
=======
from Security.Encryption.refresh_token import create_refresh_token
from Security.Encryption.token import create_access_token
>>>>>>> backend
from pathlib import Path
from dotenv import load_dotenv
import asyncio
router = APIRouter()

root_dir = Path(__file__).resolve().parents[3]
env_path = root_dir / "DevOp" / ".env.api"

load_dotenv(dotenv_path=env_path)

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID","")

class GoogleTokenRequest(BaseModel):
    token: str

class GoogleSchema(BaseModel):
    id: int
    username: str
    password: str = "GooglePassword"
    gmail: str    
    role: str
    is_active: bool 
    login_at: datetime

class GoogleSchemaResponse(BaseModel):
    detail: str = "Google'user login successfully!✅"
<<<<<<< HEAD
=======
    access_token: str
    refresh_token: str
    token_type: str = "Bearer"
>>>>>>> backend
    user_info: GoogleSchema

@router.post("/google_login", response_model=GoogleSchemaResponse)
async def google_auth(payload: GoogleTokenRequest, db: Annotated[AsyncSession, Depends(get_session)]):
    try:
        # Verify Google ID Token
        idinfo = id_token.verify_oauth2_token(
            payload.token, 
            google_requests.Request(), 
            GOOGLE_CLIENT_ID
        )

        email = idinfo.get("email")
<<<<<<< HEAD
        name = idinfo.get("name", "Google User")
=======

>>>>>>> backend

        if not email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, 
                detail="This email not found in our application! Please go to signing up here !."
            )

        # Check if user exists in database
        statement = select(GoogleSignIn).where(GoogleSignIn.gmail == email)
        result = await db.scalars(statement)
        user = result.first()
 
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="This Google's account didn't sign in yet !"
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is deactivated."
            )

        
        current_time = datetime.now(timezone.utc)
        query = await db.scalars(select(UserGoogleLogin).where(UserGoogleLogin.gmail == email))
        final_query = query.first()
<<<<<<< HEAD
        # ✅ ត្រូវ
=======
        
>>>>>>> backend
        if final_query:
            final_query.login_at = current_time
            db.add(final_query)
        else:
            add_google_user = UserGoogleLogin(
                google_id=user.id,
                login_at=current_time,
                username=user.username.title(),
                gmail=user.gmail,
                role=user.role,
                is_active=user.is_active,
            )
            db.add(add_google_user)
        await asyncio.sleep(0.4)    
        await db.commit()
<<<<<<< HEAD
        

=======

        
        dicts = {
                   "sub": str(user.id),
                   "gmail": user.gmail,
                   "role": user.role,
               }
        token = create_access_token(dicts)
        refresh_token = create_refresh_token(dicts)
>>>>>>> backend
     
        result_response = GoogleSchema(
            id=user.id,
            username=user.username.title(),
            gmail=user.gmail,
            role=user.role,        
            is_active=user.is_active, 
            login_at=current_time
        )
        
        return GoogleSchemaResponse(
            detail="Google'user login successfully!✅",
<<<<<<< HEAD
=======
            access_token = token,
            refresh_token=refresh_token,
            token_type="Bearer",
>>>>>>> backend
            user_info=result_response
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Token verification failed: {str(e)}"
        )
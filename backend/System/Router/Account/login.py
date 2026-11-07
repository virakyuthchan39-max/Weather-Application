from fastapi import (APIRouter, Depends, status, HTTPException)
from pydantic import BaseModel, Field, EmailStr
from typing import Annotated
from datetime import datetime, timezone

from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from Database.model_account import UserLogin, UserSignIn
from Database.database import get_session

# security
from fastapi.security import HTTPAuthorizationCredentials
from Security.Encryption.hash import verify_password
from Security.Encryption.token import create_access_token
from Security.Encryption.refresh_token import (
    create_refresh_token,

)
import asyncio

router = APIRouter()


class RefreshRequest(BaseModel):
    refresh_token: str

class LoginUserRequest(BaseModel):
    gmail: EmailStr
    password: Annotated[str, Field(default=None, min_length=8, max_length=400)]

class LoginSchema(BaseModel):
    id: int
    full_name: Annotated[str, Field(default=None, max_length=40, min_length=5)]
    gmail: EmailStr
    login_at: Annotated[str, Field(default_factory=lambda: datetime.now(timezone.utc).strftime("%d %b %Y (%I:%M %p)"))]
    is_active: Annotated[bool, Field(default=True)]
    account_type: Annotated[str,Field(default="Regular")]
    role: Annotated[str, Field(default="user")]

class LoginSchemaResponse(BaseModel):
    detail: Annotated[str, Field(default="This user login account successfully! ✅")]
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user_info: LoginSchema



@router.post("/loginAccount", status_code=status.HTTP_200_OK, response_model=LoginSchemaResponse)
async def login_User(userAccount: LoginUserRequest,db: Annotated[AsyncSession, Depends(get_session)]):
    """
    ***Login Account user Operation!***
    Here! in this operation, they require most of gmail and password for access the application here
    ***Gmail*** would be EmailStr
    ***Password*** would be Str and at least 8 character range.
    """
    
    # ១. ស្វែងរក User ក្នុង UserSignIn
    query = await db.scalars(select(UserSignIn).where(UserSignIn.gmail == userAccount.gmail))
    final_query = query.first()
    if not final_query:
        raise HTTPException(detail="Cannot find this account in our data! Please try again!", status_code=status.HTTP_400_BAD_REQUEST)
    

    if not verify_password(userAccount.password, final_query.password):
        raise HTTPException(detail="Invalid password or email. Please try again!", status_code=status.HTTP_400_BAD_REQUEST)
    
    final_query.is_active = True
    db.add(final_query)
    target_user = final_query
    current_time = datetime.now(timezone.utc).strftime("%d %b %Y (%I:%M %p)")

    query_login = await db.scalars(select(UserLogin).where(UserLogin.gmail == userAccount.gmail))
    final_query_login = query_login.first()
    
    if final_query_login:
      
        final_query_login.login_at = current_time
        final_query_login.is_active = True
        final_query_login.role = final_query.role
        db.add(final_query_login)
        target_user = final_query_login
    else:
     
        add_user_db = UserLogin(
            username=final_query.username.title(),
            register_id=final_query.id,
            gmail=final_query.gmail,
            login_at=current_time,
            is_active=True,
            role=final_query.role
        )
        db.add(add_user_db)
        target_user = add_user_db

    await db.commit() 
    await asyncio.sleep(0.5)
    await db.refresh(target_user)

    # ៤. បង្កើត Token
    token_data = {
    "sub": str(target_user.id),
    "gmail": target_user.gmail,
    "role": target_user.role,
}

    access = create_access_token(token_data)
    refresh = create_refresh_token(token_data)
  
    
 
    result_response = LoginSchema(
        id=final_query.id, 
        full_name=final_query.username, 
        gmail=final_query.gmail, 
        login_at=target_user.login_at, 
        is_active=target_user.is_active, 
        account_type= target_user.account_type,
        role=target_user.role
    )
    
    return LoginSchemaResponse(
        detail="This user login account successfully! ✅", 
        access_token=access, 
        refresh_token=refresh,
        user_info=result_response
    )



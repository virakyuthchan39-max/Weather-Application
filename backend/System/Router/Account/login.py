from fastapi import (APIRouter, Depends, status, HTTPException)
from pydantic import BaseModel, Field, EmailStr
from typing import Annotated
from datetime import datetime, timezone

from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from Database.model import UserLogin, UserSignIn
from Database.database import get_session

from Security.Encryption.hash import verify_password
from Security.Encryption.token import create_access_token


class LoginUserRequest(BaseModel):
    gmail: EmailStr
    password: Annotated[str, Field(default=None, min_length=8, max_length=400)]


class LoginSchema(BaseModel):
    id: int
    full_name: Annotated[str, Field(default=None, max_length=40, min_length=5)]
    gmail: EmailStr
    login_at: Annotated[datetime, Field(default_factory=lambda: datetime.now(timezone.utc))]
    is_active: Annotated[bool, Field(default=True)]
    role: Annotated[str, Field(default="user")]


class LoginSchemaResponse(BaseModel):
    detail: Annotated[str, Field(default="This user login account successfully! ✅")]
    access_token: str
    token_type: str = "bearer"
    user_info: LoginSchema


router = APIRouter()


@router.post("/loginAccount", status_code=status.HTTP_200_OK, response_model=LoginSchemaResponse)
async def login_User(userAccount: LoginUserRequest, db: Annotated[AsyncSession, Depends(get_session)]):
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
    
    # ២. ផ្ទៀងផ្ទាត់ Password
    if not verify_password(userAccount.password, final_query.password):
        raise HTTPException(detail="Invalid password or email. Please try again!", status_code=status.HTTP_400_BAD_REQUEST)
    
    current_time = datetime.now(timezone.utc)

    # ៣. ពិនិត្យមើលថាតើ UserLogin ធ្លាប់មាន record សម្រាប់ gmail នេះរួចហើយឬยัง
    query_login = await db.scalars(select(UserLogin).where(UserLogin.gmail == userAccount.gmail))
    final_query_login = query_login.first()

    if final_query_login:
      
        final_query_login.login_at = current_time
        final_query_login.is_active = final_query.is_active
        final_query_login.role = final_query.role
        db.add(final_query_login)
        target_user = final_query_login
    else:
     
        add_user_db = UserLogin(
            username=final_query.username,
            register_id=final_query.id,
            gmail=final_query.gmail,
            login_at=current_time,
            is_active=final_query.is_active,
            role=final_query.role
        )
        db.add(add_user_db)
        target_user = add_user_db

    await db.commit() 
    await db.refresh(target_user)

    # ៤. បង្កើត Token
    token = create_access_token({
        "sub": str(final_query.id),
        "gmail": final_query.gmail,
        "role": final_query.role,
    })

    # ៥. រៀបចំ Response ឱ្យត្រឹមត្រូវ
    result_response = LoginSchema(
        id=final_query.id, 
        full_name=final_query.username, 
        gmail=final_query.gmail, 
        login_at=target_user.login_at, 
        is_active=target_user.is_active, 
        role=target_user.role
    )
    
    return LoginSchemaResponse(
        detail="This user login account successfully! ✅", 
        access_token=token, 
        user_info=result_response
    )
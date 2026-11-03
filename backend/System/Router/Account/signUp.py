from fastapi import (APIRouter,Depends,status,HTTPException)
from pydantic import BaseModel,Field,EmailStr
from typing import Annotated
from datetime import datetime,timezone

from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from Database.model_account import UserSignIn
from Database.database import get_session

from Security.Encryption.hash import hash_password
# security
from fastapi.security import HTTPAuthorizationCredentials
from Security.Encryption.token import create_access_token
from Security.Encryption.refresh_token import (
    get_current_user,
    create_refresh_token,
    refresh_access_token,
    blacklist_token,
    bearer_scheme,
)
import asyncio

router = APIRouter()

class RefreshRequest(BaseModel):
    refresh_token: str

class CreateUserRequest(BaseModel):
    first_name: Annotated[str,Field(max_length=20,min_length=3)]
    last_name: Annotated[str,Field(max_length=20,min_length=3)]
    gmail: EmailStr
    password: Annotated[str,Field(min_length=8,max_length=72)]


class CreateSchema(BaseModel):
    id: int
    full_name: Annotated[str,Field(default=None,max_length=40,min_length=5)]
    gmail: EmailStr
    account_type: str = "Regular"
    create_at: Annotated[datetime,Field(default_factory=lambda:datetime.now(timezone.utc))]
    is_active:Annotated[bool,Field(default=True)]
    role: Annotated[str,Field(default="user")]


class CreateSchemaResponse(BaseModel):
    detail: Annotated[str, Field(default ="This user create account successfully! ✅")]
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user_info: CreateSchema



def full_name(first:str,Last:str):
    return f"{first} {Last}"

@router.post("/createAccount", status_code=status.HTTP_201_CREATED, response_model=CreateSchemaResponse)
async def Create_User(
    userAccount: CreateUserRequest,
    db: Annotated[AsyncSession, Depends(get_session)],
): 
    """
          ***Account Creation user Operation!***
          Here! in this operation, they require most of username , gmail and password for access the application here
          ***Username*** would be combind with first name and last name  and also the string 
          ***Gmail*** would be EmailStr
          ***Password*** would be Str and at least 8 character range.
    """

    query = await db.scalars(select(UserSignIn).where(UserSignIn.gmail == userAccount.gmail))
    if query.first():
        raise HTTPException(
            detail="This email already used!",
            status_code=status.HTTP_400_BAD_REQUEST,
        )

    hashed_pwd = hash_password(userAccount.password)
    username = full_name(userAccount.first_name, userAccount.last_name)

    add_user_db = UserSignIn(
        username=username,
        password=hashed_pwd,
        gmail=userAccount.gmail,
        create_at=datetime.now(timezone.utc),
        is_active=True,
        role="user",
    )
    db.add(add_user_db)
    await asyncio.sleep(1.5)
    await db.commit()
    await db.refresh(add_user_db)
    dicts={
           "sub": str(add_user_db.id),
            "gmail": add_user_db.gmail,
            "role": add_user_db.role,
        }
    token = create_access_token(dicts)
    refresh = create_refresh_token(dicts)
    
    result_response = CreateSchema(
        id=add_user_db.id,
        full_name=add_user_db.username.title(),
        account_type= add_user_db.account_type,
        gmail=add_user_db.gmail,
        create_at=add_user_db.create_at,
        is_active=add_user_db.is_active,
        role=add_user_db.role,
    )
    return CreateSchemaResponse(
        detail="This user create account successfully! ✅",
        access_token=token,
        refresh_token= refresh,
        user_info=result_response,
    )

@router.post("/refreshToken")
async def refresh(payload: RefreshRequest):
    return await refresh_access_token(payload.refresh_token)
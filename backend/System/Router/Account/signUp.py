from fastapi import (APIRouter,Depends,status,HTTPException)
from pydantic import BaseModel,Field,EmailStr
from typing import Annotated
from datetime import datetime,timezone

from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from Database.model import UserSignIn
from Database.database import get_session

from Security.Encryption.hash import hash_password
from Security.Encryption.token import create_access_token


class CreateUserRequest(BaseModel):
    first_name: Annotated[str,Field(default=None,max_length=20,min_length=3)]
    last_name: Annotated[str,Field(default=None,max_length=20,min_length=3)]
    gmail: EmailStr
    password: Annotated[str,Field(default=None,min_length=8,max_length=400)]


class CreateSchema(BaseModel):
    id: int
    full_name: Annotated[str,Field(default=None,max_length=40,min_length=5)]
    gmail: EmailStr
    create_at: Annotated[datetime,Field(default_factory=lambda:datetime.now(timezone.utc))]
    is_active:Annotated[bool,Field(default=True)]
    role: Annotated[str,Field(default="user")]


class CreateSchemaResponse(BaseModel):
    detail: Annotated[str, Field(default ="This user create account successfully! ✅")]
    access_token: str
    token_type: str = "bearer"
    user_info: CreateSchema


router = APIRouter()


def full_name(first:str,Last:str):
    return f"{first} {Last}"


@router.post("/createAccount",status_code= status.HTTP_201_CREATED,response_model =CreateSchemaResponse)
async def CreateUser(userAccount:CreateUserRequest,db:Annotated[AsyncSession,Depends(get_session)]):
    """
      ***Account Creation user Operation!***
      Here! in this operation, they require most of username , gmail and password for access the application here
      ***Username*** would be combind with first name and last name  and also the string 
      ***Gmail*** would be EmailStr
      ***Password*** would be Str and at least 8 character range.
    """

    hashed_pwd = hash_password(userAccount.password)
    query = await db.scalars(select(UserSignIn).where(UserSignIn.gmail == userAccount.gmail))
    final_query = query.first()
    if final_query:
        raise HTTPException(detail= "This email already used!",status_code = status.HTTP_400_BAD_REQUEST)

    add_user_db = UserSignIn(username=full_name(userAccount.first_name,userAccount.last_name),password=hashed_pwd,gmail=userAccount.gmail,create_at= datetime.now(timezone.utc),is_active=True,role= "user")
    db.add(add_user_db)
    await db.commit()


    token = create_access_token({
        "sub": str(add_user_db.id),
        "gmail": add_user_db.gmail,
        "role": add_user_db.role,
    })

    result_response= CreateSchema(id=add_user_db.id, username=add_user_db.username, gmail=add_user_db.gmail, create_at= datetime.now(timezone.utc), is_active=True, role= "user")
    return CreateSchemaResponse(detail = "This user create account successfully! ✅", access_token=token, user_info=result_response)
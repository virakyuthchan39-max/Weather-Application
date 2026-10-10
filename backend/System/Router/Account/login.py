from fastapi import (APIRouter,Depends,status,HTTPException)
from pydantic import BaseModel,Field,EmailStr
from typing import Annotated
from datetime import datetime,timezone

from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from Database.model import UserLogin,UserSignIn
from Database.database import get_session

from Security.Encryption.hash import verify_password
from Security.Encryption.token import create_access_token


class LoginUserRequest(BaseModel):
    gmail: EmailStr
    password: Annotated[str,Field(default=None,min_length=8,max_length=400)]


class LoginSchema(BaseModel):
    id: int
    full_name: Annotated[str,Field(default=None,max_length=40,min_length=5)]
    gmail: EmailStr
    login_at: Annotated[str,Field(default_factory=lambda:datetime.now(timezone.utc))]
    is_active:Annotated[bool,Field(default=True)]
    role:Annotated[str,Field(default="user")]


class LoginSchemaResponse(BaseModel):
    detail: Annotated[str, Field(default ="This user create account successfully! ✅")]
    access_token: str
    token_type: str = "bearer"
    user_info: LoginSchema


router = APIRouter()


@router.post("/loginAccount",status_code= status.HTTP_201_CREATED,response_model =LoginSchemaResponse)
async def loginUser(userAccount:LoginUserRequest,db:Annotated[AsyncSession,Depends(get_session)]):
    """
      ***Login Account user Operation!***
      Here! in this operation, they require most of gmail and password for access the application here
      ***Gmail*** would be EmailStr
      ***Password*** would be Str and at least 8 character range.
    """

    query = await db.scalars(select(UserSignIn).where(UserSignIn.gmail == userAccount.gmail))
    final_query = query.first()
    if not final_query:
        raise HTTPException(detail= "Cannot find this account in our data! Please try again!",status_code = status.HTTP_400_BAD_REQUEST)
    if not verify_password(userAccount.password, final_query.password):
        raise HTTPException(detail="Invalid password or email. Please try again!", status_code = status.HTTP_400_BAD_REQUEST)

    add_user_db = UserLogin(full_name=final_query.full_name,register_id=final_query.id,gmail=userAccount.gmail,login_at= datetime.now(timezone.utc),is_active=True,role= "user")
    db.add(add_user_db)
    await db.commit()


    token = create_access_token({
        "sub": str(add_user_db.id),
        "gmail": add_user_db.gmail,
        "role": add_user_db.role,
    })

    result_response= LoginSchema(id=add_user_db.id, full_name=final_query.full_name, gmail=userAccount.gmail, login_at= datetime.now(timezone.utc), is_active=True, role= "user")
    return LoginSchemaResponse(detail = "This user login account successfully! ✅", access_token=token, user_info=result_response)
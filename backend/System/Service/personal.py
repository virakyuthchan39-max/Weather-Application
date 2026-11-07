from fastapi import (APIRouter, Depends, status, HTTPException)
from pydantic import BaseModel, Field, EmailStr
from typing import Annotated
from datetime import datetime, timezone

from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from Database.model_account import ( UserSignIn,UserLogin)
from Database.model_application import (PersonalInfo)
from Database.database import get_session

# from Security.Encryption.hash import verify_password
from fastapi.security import HTTPAuthorizationCredentials
from Security.Encryption.token import create_access_token
from Security.Encryption.refresh_token import (
    get_current_user,
    decode_token,
    create_refresh_token,
    refresh_access_token,
    blacklist_token,
    bearer_scheme,
)
from .favorite_list import verify_user
router = APIRouter()

class PersonalRequest(BaseModel):
    id: int
    full_name: Annotated[str, Field(default=None, max_length=40, min_length=5)]
    gmail: EmailStr
    account_type:str
    bio: Annotated[str, Field(default="",max_length=255)]
    profile: Annotated[str, Field(default="")]
class PersonalSchema(BaseModel):
    id: int
    full_name: Annotated[str, Field(default=None, max_length=40, min_length=5)]
    gmail: EmailStr
    account_type:str
    change_at: Annotated[str, Field(default_factory=lambda:datetime.now(timezone.utc).strftime("%d %b %Y (%I:%M %p)"))]
    bio: Annotated[str, Field(default="",max_length=255)]
    profile: Annotated[str, Field(default="")]

class PersonalSchemaResponse(BaseModel):
    detail: Annotated[str, Field(default="This user Personal account successfully! ✅")]
    user_info: PersonalSchema


@router.post("/PersonalAccount", status_code=status.HTTP_200_OK, response_model=PersonalSchemaResponse)
async def Personal_User(
    userAccount: PersonalRequest,
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(bearer_scheme)],
    db: Annotated[AsyncSession, Depends(get_session)],
):
    # ១. ទាញ token ពី header
    if credentials is None or not credentials.credentials:
        raise HTTPException(
            detail="Not authenticated.",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )
    token = credentials.credentials           


    try:
        await decode_token(token, expected_type="access")
    except HTTPException:
        raise

    # ៣. ដាក់ token ចូល Redis blacklist
    await blacklist_token(token)

    final_query = await verify_user(db,userAccount.id,userAccount.gmail,userAccount.account_type)

    query_Personal = await db.scalars(select(PersonalInfo).where(PersonalInfo.gmail == userAccount.gmail))
    final_query_Personal = query_Personal.first()
    
    if final_query_Personal:
        final_query_Personal.change_at = datetime.now(timezone.utc).strftime("%d %b %Y (%I:%M %p)")
        final_query_Personal.bio = userAccount.bio
        final_query_Personal.profile = userAccount.profile
        final_query_Personal.full_name = userAccount.full_name
        db.add(final_query_Personal)
    else:
        add_user_Personal = PersonalInfo(
            full_name=userAccount.full_name.title(),
            gmail=final_query.gmail,
            bio=userAccount.bio,
            account_type=final_query.account_type,
            change_at=datetime.now(timezone.utc).strftime("%d %b %Y (%I:%M %p)"),
            profile=userAccount.profile,
        )
        db.add(add_user_Personal)

    await db.commit()

    result_response = PersonalSchema(
        id=final_query.id,
        full_name=userAccount.full_name,
        gmail=final_query.gmail,
        account_type=final_query.account_type,
        bio=userAccount.bio,
        change_at=datetime.now(timezone.utc).strftime("%d %b %Y (%I:%M %p)"),
        profile=userAccount.profile
        
  
    )
    return PersonalSchemaResponse(
        detail="This user Personal account successfully! ✅",
        user_info=result_response,
    )


@router.get("/PersonalInfo", status_code=status.HTTP_200_OK, response_model=PersonalSchemaResponse)
async def Get_Personal_User(
    gmail: EmailStr,
    account_type: str,
    user_id: int,
    db: Annotated[AsyncSession, Depends(get_session)],
):
   

    final_query = await verify_user(db, user_id, gmail, account_type)

    query_Personal = await db.scalars(
        select(PersonalInfo).where(
            (PersonalInfo.gmail == gmail) &
            (PersonalInfo.account_type == final_query.account_type)
        )
    )
    final_query_Personal = query_Personal.first()

    if not final_query_Personal:
        raise HTTPException(
            detail="No personal info yet.",
            status_code=status.HTTP_404_NOT_FOUND,
        )

    result_response = PersonalSchema(
        id=final_query.id,
        full_name=final_query_Personal.full_name,
        gmail=final_query_Personal.gmail,
        account_type=final_query_Personal.account_type,
        bio=final_query_Personal.bio,
        change_at=final_query_Personal.change_at,
        profile=final_query_Personal.profile,
    )
    return PersonalSchemaResponse(
        detail="Personal info fetched! ✅",
        user_info=result_response,
    )
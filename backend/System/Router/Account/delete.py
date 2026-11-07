from fastapi import (APIRouter, Depends, status, HTTPException)
from pydantic import BaseModel, Field, EmailStr
from typing import Annotated
from datetime import datetime, timezone

from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from Database.model_account import (UserDelete, UserSignIn, UserLogin)
from Database.model_application import (NotificationUser, FavoriteCity)                        
from Database.database import get_session

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

router = APIRouter()

class DeleteUserRequest(BaseModel):
    gmail: EmailStr
    account_type: str

class DeleteSchema(BaseModel):
    id: int
    full_name: Annotated[str, Field(default=None, max_length=40, min_length=5)]
    gmail: EmailStr
    account_type: str = "Regular"
    # Fixed: Changed type to str to match the formatted date string, or keep as datetime and format when returning
    delete_at: str
    is_active: Annotated[bool, Field(default=True)]
    role: Annotated[str, Field(default="user")]

class DeleteSchemaResponse(BaseModel):
    detail: Annotated[str, Field(default="This user Delete account successfully! ✅")]
    user_info: DeleteSchema


@router.delete("/deleteAccount", status_code=status.HTTP_200_OK, response_model=DeleteSchemaResponse)
async def Delete_User(
    userAccount: DeleteUserRequest,
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(bearer_scheme)],
    db: Annotated[AsyncSession, Depends(get_session)],
):
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

    # Add token to Redis blacklist
    await blacklist_token(token)

    # 1. Fetch UserSignIn
    query = await db.scalars(select(UserSignIn).where(UserSignIn.gmail == userAccount.gmail))
    final_query = query.first()
    if not final_query:
        raise HTTPException(
            detail="Cannot find this account in our data! Please try again!",
            status_code=status.HTTP_400_BAD_REQUEST,
        )
        
    # Store user info before deletion for the response
    user_id   = final_query.id
    user_name = final_query.username
    user_gmail = final_query.gmail
    user_type = final_query.account_type
    user_role = final_query.role
    now = datetime.now(timezone.utc).strftime("%d %b %Y (%I:%M %p)")

    # 2. Fetch related records correctly with distinct query variables
    query_fav = await db.scalars(select(FavoriteCity).where((FavoriteCity.gmail == userAccount.gmail) & (FavoriteCity.account_type == userAccount.account_type)))
    final_query_fav = query_fav.all()
    
    query_notif = await db.scalars(select(NotificationUser).where((NotificationUser.gmail == userAccount.gmail) & (NotificationUser.account_type == userAccount.account_type)))
    final_query_notif = query_notif.all()
    
    query_Login = await db.scalars(select(UserLogin).where(UserLogin.gmail == userAccount.gmail))
    final_query_Login = query_Login.first()
    
    query_Delete = await db.scalars(
    select(UserDelete).where(
        (UserDelete.gmail == userAccount.gmail) &
        (UserDelete.account_type == "Regular")
    )
)
    final_query_Delete = query_Delete.first()
    
    if final_query_Delete:
        final_query_Delete.delete_at = now
        final_query_Delete.is_active = False
        final_query_Delete.signin_id = None      # ← NULL the FK
        final_query_Delete.login_id  = None      # ← NULL the FK
        db.add(final_query_Delete)
    else:
        db.add(UserDelete(
            username=user_name,
            signin_id=None,          # ← no FK to a row about to vanish
            login_id=None,           # ← no FK to a row about to vanish
            gmail=user_gmail,
            account_type=user_type,
            delete_at=now,
            is_active=False,
            role=user_role,
        ))
        await db.flush()
        for item in final_query_notif: await db.delete(item)
        for item in final_query_fav: await db.delete(item)
        if final_query_Login: await db.delete(final_query_Login)
        await db.delete(final_query)

    await db.commit()

    # Build response using safely stored variables since the main user object was deleted
    return DeleteSchemaResponse(
    detail="This user Delete account successfully! ✅",
    user_info=DeleteSchema(
        id=user_id, full_name=user_name, gmail=user_gmail,
        account_type=user_type, delete_at=now,
        is_active=False, role=user_role,
    ),
)
    return DeleteSchemaResponse(
        detail="This user Delete account successfully! ✅",
        user_info=result_response,
    )
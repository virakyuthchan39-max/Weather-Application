from fastapi import (APIRouter, Depends, status, HTTPException)
from pydantic import BaseModel, Field, EmailStr
from typing import Annotated
from datetime import datetime, timezone

from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from Database.model_account import (
            UserDelete,
            GoogleSignIn,UserGoogleLogin,
            GithubSignIn,UserGithubLogin,
            FacebookSignIn,UserFacebookLogin                   
            )
from Database.model_application import (NotificationUser,FavoriteCity)
from Database.database import get_session
from fastapi.security import HTTPBearer,HTTPAuthorizationCredentials
from Security.Encryption.refresh_token import decode_token
from Memory.blacklist_token import blacklist_token

security = HTTPBearer()
router = APIRouter()

class deleteUserRequest(BaseModel):
    gmail: EmailStr
    account_type: str 

class deleteSchema(BaseModel):
    id: int
    full_name: Annotated[str, Field(default=None, max_length=40, min_length=5)]
    gmail: EmailStr
    delete_at: Annotated[str, Field(default_factory=lambda: datetime.now(timezone.utc).strftime("%d %b %Y (%I:%M %p)"))]
    is_active: Annotated[bool, Field(default=True)]
    role: Annotated[str, Field(default="user")]

class deleteSchemaResponse(BaseModel):
    detail: Annotated[str, Field(default="This user delete account successfully! ✅")]
    user_info: deleteSchema

# check the token
async def Check_Valid_Token(credentials:str):
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
    await blacklist_token(token)


@router.delete("/delete_google", status_code=status.HTTP_200_OK, response_model=deleteSchemaResponse)
async def delete_Google_User(
    userAccount: deleteUserRequest, 
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)], 
    db: Annotated[AsyncSession, Depends(get_session)]
):
    await Check_Valid_Token(credentials)
    
    query = await db.scalars(select(GoogleSignIn).where((GoogleSignIn.gmail == userAccount.gmail) & (GoogleSignIn.account_type == userAccount.account_type.capitalize())))
    final_query = query.first()
    if not final_query:
        raise HTTPException(detail="Cannot find this account!", status_code=status.HTTP_400_BAD_REQUEST)
  
    final_query.is_active = False
    db.add(final_query) 
    
    query_Login = await db.scalars(select(UserGoogleLogin).where((UserGoogleLogin.gmail == userAccount.gmail) & (UserGoogleLogin.account_type == userAccount.account_type.capitalize())))
    final_query_Login = query_Login.first()
    final_query.is_active = False
    db.add(final_query)
    
    if final_query_Login:
        final_query_Login.is_active = False
        db.add(final_query_Login)    
        
    query_fav = await db.scalars(select(FavoriteCity).where((FavoriteCity.gmail == userAccount.gmail) & (FavoriteCity.account_type == userAccount.account_type.capitalize())))
    final_query_fav= query_fav.all()
    
    query_notif = await db.scalars(select(NotificationUser).where((NotificationUser.gmail == userAccount.gmail) & (NotificationUser.account_type == userAccount.account_type.capitalize())))
    final_query_notif = query_notif.all()

    
    query_delete = await db.scalars(select(UserDelete).where((UserDelete.gmail == userAccount.gmail) & (UserDelete.account_type == userAccount.account_type.capitalize())))
    final_query_delete = query_delete.first()
    
    resp_id       = final_query.id
    resp_username = final_query.username
    resp_gmail    = final_query.gmail
    resp_role     = final_query.role
    now = datetime.now(timezone.utc).strftime("%d %b %Y (%I:%M %p)")

    if final_query_delete:
        final_query_delete.delete_at = now
        final_query_delete.is_active = False
        final_query_delete.google_signin_id = None
        final_query_delete.google_login_id  = None
        db.add(final_query_delete)
    else:
        db.add(UserDelete(
            username=resp_username,
            google_signin_id=None,
            google_login_id=None,
            account_type=final_query.account_type,
            gmail=resp_gmail,
            delete_at=now,
            is_active=False,
            role=resp_role,
        ))

    await db.flush()

    for item in final_query_fav:   await db.delete(item)
    for item in final_query_notif: await db.delete(item)
    if final_query_Login:          await db.delete(final_query_Login)
    await db.delete(final_query)

    await db.commit()

    result_response = deleteSchema(
        id=resp_id, full_name=resp_username, gmail=resp_gmail,
        delete_at=now, is_active=False, role=resp_role,
    )
    return deleteSchemaResponse(
        detail="This Google's user delete account successfully! ✅", 
        user_info=result_response
    )


@router.delete("/delete_github", status_code=status.HTTP_200_OK, response_model=deleteSchemaResponse)
async def delete_Github_User(  
    userAccount: deleteUserRequest, db: Annotated[AsyncSession, Depends(get_session)],
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)]
):
    await Check_Valid_Token(credentials)
    query = await db.scalars(select(GithubSignIn).where(GithubSignIn.gmail == userAccount.gmail))
    final_query = query.first()
    if not final_query:
        raise HTTPException(detail="Cannot find this account in our data! Please try again!", status_code=status.HTTP_400_BAD_REQUEST)
    
    query_Login = await db.scalars(select(UserGithubLogin).where((UserGithubLogin.gmail == userAccount.gmail) & (UserGithubLogin.account_type == userAccount.account_type.capitalize())))
    final_query_Login = query_Login.first()
    final_query.is_active = False
    db.add(final_query)
    
    if final_query_Login:
        final_query_Login.is_active = False
        db.add(final_query_Login)
    query_fav = await db.scalars(select(FavoriteCity).where((FavoriteCity.gmail == userAccount.gmail) & (FavoriteCity.account_type == userAccount.account_type.capitalize())))
    final_query_fav= query_fav.all()
    
    query_notif = await db.scalars(select(NotificationUser).where((NotificationUser.gmail == userAccount.gmail) & (NotificationUser.account_type == userAccount.account_type.capitalize())))
    final_query_notif = query_notif.all()
    query_delete = await db.scalars(select(UserDelete).where((UserDelete.gmail == userAccount.gmail) & (UserDelete.account_type == userAccount.account_type.capitalize())))
    final_query_delete = query_delete.first()
  
    resp_id       = final_query.id
    resp_username = final_query.username
    resp_gmail    = final_query.gmail
    resp_role     = final_query.role
    now = datetime.now(timezone.utc).strftime("%d %b %Y (%I:%M %p)")

    if final_query_delete:
        final_query_delete.delete_at = now
        final_query_delete.is_active = False
        final_query_delete.github_signin_id = None
        final_query_delete.github_login_id  = None
        db.add(final_query_delete)
    else:
        db.add(UserDelete(
            username=resp_username,
            github_signin_id=None,
            github_login_id=None,
            account_type=final_query.account_type,
            gmail=resp_gmail,
            delete_at=now,
            is_active=False,
            role=resp_role,
        ))

    await db.flush()

    for item in final_query_fav:   await db.delete(item)
    for item in final_query_notif: await db.delete(item)
    if final_query_Login:          await db.delete(final_query_Login)
    await db.delete(final_query)

    await db.commit()

    result_response = deleteSchema(
        id=resp_id, full_name=resp_username, gmail=resp_gmail,
        delete_at=now, is_active=False, role=resp_role,
    )
    return deleteSchemaResponse(
            detail="This Github's user delete account successfully! ✅", 
            user_info=result_response
        )
    


@router.delete("/delete_facebook", status_code=status.HTTP_200_OK, response_model=deleteSchemaResponse)
async def delete_Facebook_User(
    userAccount: deleteUserRequest, db: Annotated[AsyncSession, Depends(get_session)],
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)]
):
    await Check_Valid_Token(credentials)
    query = await db.scalars(select(FacebookSignIn).where(FacebookSignIn.gmail == userAccount.gmail))
    final_query = query.first()
    if not final_query:
        raise HTTPException(detail="Cannot find this account in our data! Please try again!", status_code=status.HTTP_400_BAD_REQUEST)
    
    query_Login = await db.scalars(select(UserFacebookLogin).where((UserFacebookLogin.gmail == userAccount.gmail) & (UserFacebookLogin.account_type == userAccount.account_type.capitalize())))
    final_query_Login = query_Login.first()

    final_query.is_active = False
    db.add(final_query)
    
    if final_query_Login:
        final_query_Login.is_active = False
        db.add(final_query_Login)
        
    query_fav = await db.scalars(select(FavoriteCity).where((FavoriteCity.gmail == userAccount.gmail) & (FavoriteCity.account_type == userAccount.account_type.capitalize())))
    final_query_fav= query_fav.all()
    
    query_notif = await db.scalars(select(NotificationUser).where((NotificationUser.gmail == userAccount.gmail) & (NotificationUser.account_type == userAccount.account_type.capitalize())))
    final_query_notif = query_notif.all()
    
    query_delete = await db.scalars(select(UserDelete).where((UserDelete.gmail == userAccount.gmail) & (UserDelete.account_type == userAccount.account_type)))
    final_query_delete = query_delete.first()
    
    resp_id       = final_query.id
    resp_username = final_query.username
    resp_gmail    = final_query.gmail
    resp_role     = final_query.role
    now = datetime.now(timezone.utc).strftime("%d %b %Y (%I:%M %p)")

    if final_query_delete:
        final_query_delete.delete_at = now
        final_query_delete.is_active = False
        final_query_delete.facebook_signin_id = None
        final_query_delete.facebook_login_id  = None
        db.add(final_query_delete)
    else:
        db.add(UserDelete(
            username=resp_username,
            facebook_signin_id=None,
            facebook_login_id=None,
            account_type=final_query.account_type,
            gmail=resp_gmail,
            delete_at=now,
            is_active=False,
            role=resp_role,
        ))

    await db.flush()

    for item in final_query_fav:   await db.delete(item)
    for item in final_query_notif: await db.delete(item)
    if final_query_Login:          await db.delete(final_query_Login)
    await db.delete(final_query)

    await db.commit()

    result_response = deleteSchema(
        id=resp_id, full_name=resp_username, gmail=resp_gmail,
        delete_at=now, is_active=False, role=resp_role,
    )
    return deleteSchemaResponse(
            detail="This Facebook's user delete account successfully! ✅", 
            user_info=result_response
        )
      
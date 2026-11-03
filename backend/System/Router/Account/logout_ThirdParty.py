from fastapi import (APIRouter, Depends, status, HTTPException)
from pydantic import BaseModel, Field, EmailStr
from typing import Annotated
from datetime import datetime, timezone

from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from Database.model_account import (
                            UserLogout,
                            GoogleSignIn,UserGoogleLogin,
                            GithubSignIn,UserGithubLogin,
                            FacebookSignIn,UserFacebookLogin                   
                            )
from Database.database import get_session
from fastapi.security import HTTPBearer,HTTPAuthorizationCredentials
from Security.Encryption.refresh_token import decode_token
from Memory.blacklist_token import blacklist_token

security = HTTPBearer()
router = APIRouter()

class LogoutUserRequest(BaseModel):
    gmail: EmailStr

class LogoutSchema(BaseModel):
    id: int
    full_name: Annotated[str, Field(default=None, max_length=40, min_length=5)]
    gmail: EmailStr
    logout_at: Annotated[datetime, Field(default_factory=lambda: datetime.now(timezone.utc))]
    is_active: Annotated[bool, Field(default=True)]
    role: Annotated[str, Field(default="user")]

class LogoutSchemaResponse(BaseModel):
    detail: Annotated[str, Field(default="This user Logout account successfully! ✅")]
    user_info: LogoutSchema

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


@router.post("/logout_google", status_code=status.HTTP_200_OK, response_model=LogoutSchemaResponse)
async def Logout_Google_User(
    userAccount: LogoutUserRequest, 
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)], 
    db: Annotated[AsyncSession, Depends(get_session)]
):
    await Check_Valid_Token(credentials)
    
    query = await db.scalars(select(GoogleSignIn).where(GoogleSignIn.gmail == userAccount.gmail))
    final_query = query.first()
    if not final_query:
        raise HTTPException(detail="Cannot find this account!", status_code=status.HTTP_400_BAD_REQUEST)
    
    query_Login = await db.scalars(select(UserGoogleLogin).where(UserGoogleLogin.gmail == userAccount.gmail))
    final_query_Login = query_Login.first()
    
    # បិទ is_active ទាំង SignIn និង Login
    final_query.is_active = False
    db.add(final_query)
    
    if final_query_Login:
        final_query_Login.is_active = False
        db.add(final_query_Login)

    # គ្រប់គ្រង UserLogout
    query_logout = await db.scalars(select(UserLogout).where(UserLogout.gmail == userAccount.gmail))
    final_query_logout = query_logout.first()
    
    if final_query_logout:
        final_query_logout.logout_at = datetime.now(timezone.utc)
        final_query_logout.is_active = False 
        db.add(final_query_logout)
    else:
        # ✅ កែត្រង់នេះ៖ ប្រើ Field ត្រឹមត្រូវតាម Model (google_login_id និង google_signin_id)
        add_user_logout = UserLogout(
            username=final_query.username,
            google_signin_id=final_query.id,
            google_login_id=final_query_Login.id if final_query_Login else None,
            gmail=final_query.gmail,
            logout_at=datetime.now(timezone.utc),
            is_active=False,
            role=final_query.role
        )
        db.add(add_user_logout)
        
    await db.commit() 
    
    result_response = LogoutSchema(
        id=final_query.id, 
        full_name=final_query.username, 
        gmail=final_query.gmail, 
        logout_at=datetime.now(timezone.utc), 
        is_active=False, 
        role=final_query.role
    )
    return LogoutSchemaResponse(
        detail="This Google's user Logout account successfully! ✅", 
        user_info=result_response
    )


@router.post("/logout_github", status_code=status.HTTP_200_OK, response_model=LogoutSchemaResponse)
async def Logout_Github_User(  
    userAccount: LogoutUserRequest, db: Annotated[AsyncSession, Depends(get_session)],
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)]
):
    await Check_Valid_Token(credentials)
    query = await db.scalars(select(GithubSignIn).where(GithubSignIn.gmail == userAccount.gmail))
    final_query = query.first()
    if not final_query:
        raise HTTPException(detail="Cannot find this account in our data! Please try again!", status_code=status.HTTP_400_BAD_REQUEST)
    
    query_Login = await db.scalars(select(UserGithubLogin).where(UserGithubLogin.gmail == userAccount.gmail))
    final_query_Login = query_Login.first()

    final_query.is_active = False
    db.add(final_query)
    
    if final_query_Login:
        final_query_Login.is_active = False
        db.add(final_query_Login)
    
    query_logout = await db.scalars(select(UserLogout).where(UserLogout.gmail == userAccount.gmail))
    final_query_logout = query_logout.first()
    
    if final_query_logout:
        final_query_logout.logout_at = datetime.now(timezone.utc)
        final_query_logout.is_active = False 
        db.add(final_query_logout)
    else:     
        # ✅ កែត្រង់នេះ៖ ប្រើ github_login_id និង github_signin_id
        add_user_logout = UserLogout(
            username=final_query.username,
            github_signin_id=final_query.id,
            github_login_id=final_query_Login.id if final_query_Login else None,
            gmail=final_query.gmail,
            logout_at=datetime.now(timezone.utc),
            is_active=False,
            role=final_query.role
        )
        db.add(add_user_logout)
        
    await db.commit() 
    
    result_response = LogoutSchema(
        id=final_query.id, 
        full_name=final_query.username, 
        gmail=final_query.gmail, 
        logout_at=datetime.now(timezone.utc), 
        is_active=False, 
        role=final_query.role
    )
    return LogoutSchemaResponse(
        detail="This Github's user Logout account successfully! ✅", 
        user_info=result_response
    )


@router.post("/logout_facebook", status_code=status.HTTP_200_OK, response_model=LogoutSchemaResponse)
async def Logout_Facebook_User(
    userAccount: LogoutUserRequest, db: Annotated[AsyncSession, Depends(get_session)],
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)]
):
    await Check_Valid_Token(credentials)
    query = await db.scalars(select(FacebookSignIn).where(FacebookSignIn.gmail == userAccount.gmail))
    final_query = query.first()
    if not final_query:
        raise HTTPException(detail="Cannot find this account in our data! Please try again!", status_code=status.HTTP_400_BAD_REQUEST)
    
    query_Login = await db.scalars(select(UserFacebookLogin).where(UserFacebookLogin.gmail == userAccount.gmail))
    final_query_Login = query_Login.first()

    final_query.is_active = False
    db.add(final_query)
    
    if final_query_Login:
        final_query_Login.is_active = False
        db.add(final_query_Login)
    
    query_logout = await db.scalars(select(UserLogout).where(UserLogout.gmail == userAccount.gmail))
    final_query_logout = query_logout.first()
    
    if final_query_logout:
        final_query_logout.logout_at = datetime.now(timezone.utc)
        final_query_logout.is_active = False
        db.add(final_query_logout)
    else:    
        # ✅ កែត្រង់នេះ៖ ប្រើ facebook_login_id និង facebook_signin_id
        add_user_logout = UserLogout(
            username=final_query.username,
            facebook_signin_id=final_query.id,
            facebook_login_id=final_query_Login.id if final_query_Login else None,
            gmail=final_query.gmail,
            logout_at=datetime.now(timezone.utc),
            is_active=False,
            role=final_query.role
        )
        db.add(add_user_logout)
        
    await db.commit() 
    
    result_response = LogoutSchema(
        id=final_query.id, 
        full_name=final_query.username, 
        gmail=final_query.gmail, 
        logout_at=datetime.now(timezone.utc), 
        is_active=False, 
        role=final_query.role
    )
    return LogoutSchemaResponse(
        detail="This Facebook's user Logout account successfully! ✅", 
        user_info=result_response
    )
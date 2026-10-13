from fastapi import (APIRouter, Depends, status, HTTPException)
from pydantic import BaseModel, Field, EmailStr
from typing import Annotated
from datetime import datetime, timezone

from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select
from Database.model import (
                            UserLogout,
                            GoogleSignIn,UserGoogleLogin,
                            GithubSignIn,UserGithubLogin,
                            FacebookSignIn,UserFacebookLogin                   
                            )
from Database.database import get_session

# from Security.Encryption.hash import verify_password
from fastapi.security import HTTPBearer
# from Security.Encryption.token import create_access_token

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


@router.post("/logout_google", status_code=status.HTTP_200_OK, response_model=LogoutSchemaResponse)
async def Logout_Google_User(userAccount: LogoutUserRequest, db: Annotated[AsyncSession, Depends(get_session)]):
    
        """
        ***Logout Account user (Google) Operation!***
        Here! in this operation, they require most of gmail and Token for access the application here
        ***Gmail*** would be EmailStr
        """
        query = await db.scalars(select(GoogleSignIn).where(GoogleSignIn.gmail == userAccount.gmail))
        final_query = query.first()
        if not final_query:
            raise HTTPException(detail="Cannot find this account in our data! Please try again!", status_code=status.HTTP_400_BAD_REQUEST)
        if final_query:
            final_query.is_active=False
            db.add(final_query)
            target_user = final_query
      
     
        query_Login = await db.scalars(select(UserGoogleLogin).where(UserGoogleLogin.gmail == userAccount.gmail))
        final_query_Login = query_Login.first()
    
        if final_query_Login:
            final_query_Login.is_active = False
            db.add(final_query_Login)
            target_user = final_query_Login
            
        if not final_query_Login and final_query:
            final_query.is_active=False
            db.add(final_query)
            target_user = final_query
        
        query_logout = await db.scalars(select(UserLogout).where(UserLogout.gmail == userAccount.gmail))
        final_query_logout = query_logout.first()
        if (final_query_logout and final_query):
            final_query_logout.logout_at = datetime.now(timezone.utc)
            db.add(final_query_logout)
            
        elif (not final_query_Login and final_query):    
            add_user_logout = UserLogout(
                username=final_query_Login.username,
                login_id=final_query_Login.id,
                gmail=final_query_Login.gmail,
                logout_at=datetime.now(timezone.utc),
                is_active=False,
                role=final_query_Login.role,
                user_id = final_query_Login.id
            )
            db.add(add_user_logout)
            
        await db.commit() 
        await db.refresh(target_user)
    
       
        # ៥. រៀបចំ Response ឱ្យត្រឹមត្រូវ
        result_response = LogoutSchema(
            id=final_query.id, 
            full_name=final_query.username, 
            gmail=final_query.gmail, 
            logout_at=datetime.now(timezone.utc), 
            is_active=target_user.is_active, 
            role=target_user.role,
     
        )
        
        return LogoutSchemaResponse(
            detail="This Google's user Logout account successfully! ✅", 
     
            user_info=result_response
        )

@router.post("/logout_github", status_code=status.HTTP_200_OK, response_model=LogoutSchemaResponse)
async def Logout_Github_User(userAccount: LogoutUserRequest, db: Annotated[AsyncSession, Depends(get_session)]):
    
        """
        ***Logout Account user (Github) Operation!***
        Here! in this operation, they require most of gmail and Token for access the application here
        ***Gmail*** would be EmailStr
        """
        query = await db.scalars(select(GithubSignIn).where(GithubSignIn.gmail == userAccount.gmail))
        final_query = query.first()
        if not final_query:
            raise HTTPException(detail="Cannot find this account in our data! Please try again!", status_code=status.HTTP_400_BAD_REQUEST)
        if final_query:
            final_query.is_active=False
            db.add(final_query)
            target_user = final_query
      
     
        query_Login = await db.scalars(select(UserGithubLogin).where(UserGithubLogin.gmail == userAccount.gmail))
        final_query_Login = query_Login.first()
    
        if final_query_Login:
            final_query_Login.is_active = False
            db.add(final_query_Login)
            target_user = final_query_Login
            
        if not final_query_Login and final_query:
            final_query.is_active=False
            db.add(final_query)
            target_user = final_query
        
        query_logout = await db.scalars(select(UserLogout).where(UserLogout.gmail == userAccount.gmail))
        final_query_logout = query_logout.first()
        if (final_query_logout and final_query):
            final_query_logout.logout_at = datetime.now(timezone.utc)
            db.add(final_query_logout)
            
        elif (not final_query_Login and final_query) or (final_query_Login and final_query):     
            add_user_logout = UserLogout(
                username=final_query_Login.username,
                login_id=final_query_Login.id,
                gmail=final_query_Login.gmail,
                logout_at=datetime.now(timezone.utc),
                is_active=False,
                role=final_query_Login.role,
                user_id = final_query_Login.id
            )
            db.add(add_user_logout)
            
        await db.commit() 
        await db.refresh(target_user)
    
       
       
        result_response = LogoutSchema(
            id=final_query.id, 
            full_name=final_query.username, 
            gmail=final_query.gmail, 
            logout_at=datetime.now(timezone.utc), 
            is_active=target_user.is_active, 
            role=target_user.role,
     
        )
        
        return LogoutSchemaResponse(
            detail="This Github's user Logout account successfully! ✅", 
     
            user_info=result_response
        )

@router.post("/logout_facebook", status_code=status.HTTP_200_OK, response_model=LogoutSchemaResponse)
async def Logout_Facebook_User(userAccount: LogoutUserRequest, db: Annotated[AsyncSession, Depends(get_session)]):
    
        """
        ***Logout Account user (Facebook) Operation!***
        Here! in this operation, they require most of gmail and Token for access the application here
        ***Gmail*** would be EmailStr
        """
        query = await db.scalars(select(FacebookSignIn).where(FacebookSignIn.gmail == userAccount.gmail))
        final_query = query.first()
        if not final_query:
            raise HTTPException(detail="Cannot find this account in our data! Please try again!", status_code=status.HTTP_400_BAD_REQUEST)
        if final_query:
            final_query.is_active=False
            db.add(final_query)
            target_user = final_query
      
     
        query_Login = await db.scalars(select(UserFacebookLogin).where(UserFacebookLogin.gmail == userAccount.gmail))
        final_query_Login = query_Login.first()
    
        if final_query_Login:
            final_query_Login.is_active = False
            db.add(final_query_Login)
            target_user = final_query_Login
            
        if not final_query_Login and final_query:
            final_query.is_active=False
            db.add(final_query)
            target_user = final_query
        
        query_logout = await db.scalars(select(UserLogout).where(UserLogout.gmail == userAccount.gmail))
        final_query_logout = query_logout.first()
        if (final_query_logout):
            final_query_logout.logout_at = datetime.now(timezone.utc)
            db.add(final_query_logout)
            
        elif (not final_query_Login and final_query) or (final_query_Login and final_query):    
            add_user_logout = UserLogout(
                username=final_query_Login.username,
                login_id=final_query_Login.id,
                gmail=final_query_Login.gmail,
                logout_at=datetime.now(timezone.utc),
                is_active=False,
                role=final_query_Login.role,
                user_id = final_query_Login.id
            )
            db.add(add_user_logout)
            
        await db.commit() 
        await db.refresh(target_user)
    
       
       
        result_response = LogoutSchema(
            id=final_query.id, 
            full_name=final_query.username, 
            gmail=final_query.gmail, 
            logout_at=datetime.now(timezone.utc), 
            is_active=target_user.is_active, 
            role=target_user.role,
     
        )
        
        return LogoutSchemaResponse(
            detail="This Facebook's user Logout account successfully! ✅", 
     
            user_info=result_response
        )
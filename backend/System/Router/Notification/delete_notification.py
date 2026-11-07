import uuid
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select, delete
from Service.favorite_list import verify_user
from fastapi import APIRouter, status, Depends, HTTPException
from typing import Annotated
from Database.database import get_session, get_application
from Database.model_application import NotificationUser
from Database.model_account import UserSignIn, GoogleSignIn, FacebookSignIn, GithubSignIn
from pydantic import BaseModel

from Router.Account.logout_ThirdParty import Check_Valid_Token
from fastapi.security import HTTPBearer,HTTPAuthorizationCredentials
router = APIRouter()
security = HTTPBearer()

class DeleteResponse(BaseModel):
    detail: str

async def return_username(db_user: AsyncSession, user_id: int, gmail: str, account_type: str):
    account_type = account_type.lower()
    if account_type == "regular":
        stmt = select(UserSignIn).where((UserSignIn.id == user_id) & (UserSignIn.gmail == gmail))
    elif account_type == "google":
        stmt = select(GoogleSignIn).where((GoogleSignIn.id == user_id) & (GoogleSignIn.gmail == gmail))
    elif account_type == "facebook":
        stmt = select(FacebookSignIn).where((FacebookSignIn.id == user_id) & (FacebookSignIn.gmail == gmail))
    elif account_type == "github":
        stmt = select(GithubSignIn).where((GithubSignIn.id == user_id) & (GithubSignIn.gmail == gmail))
    else:
        raise HTTPException(detail="Invalid account type!", status_code=status.HTTP_400_BAD_REQUEST)

    result = await db_user.scalars(stmt)
    final_result = result.first()
    if not final_result:
        raise HTTPException(detail=f"This {account_type} account isn't found!", status_code=status.HTTP_404_NOT_FOUND)
    return final_result

@router.delete("/delete/{notification_id}", status_code=status.HTTP_200_OK, response_model=DeleteResponse)
async def delete_notification_by_id(
    db: Annotated[AsyncSession, Depends(get_application)],
    db_user: Annotated[AsyncSession, Depends(get_session)],
    credential: Annotated[HTTPAuthorizationCredentials,Depends(security)],
    notification_id: str,
    user_id: int,
    gmail: str,
    account_type: str
):
    """
    Deletes a specific notification by its ID after verifying the user's authentication token.
    """
    await Check_Valid_Token(credential)
    
    await verify_user(db_user, user_id, gmail, account_type)
    await return_username(db_user, user_id, gmail, account_type)

    # Find the notification belonging to this user and ID
    stmt = select(NotificationUser).where(
        (NotificationUser.notification_id == notification_id) & (NotificationUser.gmail == gmail)
    )
    result = await db.scalars(stmt)
    notification = result.first()

    if not notification:
        raise HTTPException(
            detail="Notification not found or unauthorized to delete.",
            status_code=status.HTTP_404_NOT_FOUND
        )

    await db.delete(notification)
    await db.commit()

    return DeleteResponse(detail=f"Notification with ID {notification_id} deleted successfully✅ ! ")


@router.delete("/delete_all", status_code=status.HTTP_200_OK, response_model=DeleteResponse)
async def delete_all_notifications(
    db: Annotated[AsyncSession, Depends(get_application)],
    db_user: Annotated[AsyncSession, Depends(get_session)],
    credential: Annotated[HTTPAuthorizationCredentials,Depends(security)],
    user_id: int,
    gmail: str,
    account_type: str
):
    """
    Deletes all notifications belonging to the authenticated user.
    """
    
    await Check_Valid_Token(credential)
    await verify_user(db_user, user_id, gmail, account_type)
    await return_username(db_user, user_id, gmail, account_type)

    # Bulk delete all notifications matching the user's gmail
    stmt = (await db.scalars(select(NotificationUser).where(NotificationUser.gmail == gmail))).all()
    for item in stmt: await db.delete(item) 
    await db.commit()

    return DeleteResponse(detail=f"All notifications for {gmail} have been deleted successfully✅ !")
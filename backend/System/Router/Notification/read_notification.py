from fastapi import APIRouter,status,HTTPException,Depends
from pydantic import BaseModel,EmailStr
from typing import Annotated, List
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from Database.database import get_application,get_session
from Service.favorite_list import verify_user
from Database.model_application import NotificationUser
from datetime import datetime,timezone

router = APIRouter()

class NotificationReadScheme(BaseModel):
    is_read: bool
    notification_id: str
    gmail: EmailStr
    account_type:str
    user_id: int 
    read_at: str 

class NotificationReadResponse(BaseModel):
    detail: str
    read_notif_info: NotificationReadScheme

class NotificationReadAllResponse(BaseModel):
    detail: str
    read_notif_info: List[NotificationReadScheme]

@router.patch("/notification_read/{notification_id}",status_code = status.HTTP_200_OK,response_model=NotificationReadResponse)
async def Read_Notification(
    notification_id:str, user_id:int, gmail:str, account_type:str,
    db_user: Annotated[AsyncSession,Depends(get_session)],
    db:  Annotated[AsyncSession,Depends(get_application)]
    ):
    await verify_user(db_user,user_id,gmail,account_type)
    
    query_notification = (await db.scalars(
        select(NotificationUser).where((NotificationUser.gmail == gmail) & (NotificationUser.notification_id == notification_id))
    )).first()
    
    if not query_notification:
        raise HTTPException(detail="Notification not found!", status_code=status.HTTP_404_NOT_FOUND)

    utc_time = datetime.now(timezone.utc)
    current_time = utc_time.strftime("%A %d %B %Y, %I:%M %p")
    
    query_notification.is_read = True
    query_notification.read_at = current_time
    
    
    db.add(query_notification)
    await db.commit()
    await db.refresh(query_notification)
    
    result_response = NotificationReadScheme(
            user_id=user_id,
            notification_id=query_notification.notification_id,
            gmail=gmail,
            read_at=query_notification.read_at,
            is_read=True,
            account_type=account_type,
    )
    response_detail = "Reading notification was success✅ !" if query_notification.is_read  else "Unreading  notification was success✅ !"
    return NotificationReadResponse(detail=response_detail, read_notif_info=result_response)


@router.patch("/notification_read_all",status_code = status.HTTP_200_OK,response_model=NotificationReadAllResponse)
async def Read_All_Notification(
    user_id:int, gmail:str, account_type:str, 
    db_user: Annotated[AsyncSession,Depends(get_session)],
    db:  Annotated[AsyncSession,Depends(get_application)]
    ):
    await verify_user(db_user, user_id, gmail, account_type)
    
    # ✅ ប្រើ .all() ដើម្បីទាញយកទាំងអស់
    query_notifications = (await db.scalars(
        select(NotificationUser).where(NotificationUser.gmail == gmail)
    )).all()
    
    if not query_notifications:
         raise HTTPException(detail="No notifications found for this user!", status_code=status.HTTP_404_NOT_FOUND)

    utc_time = datetime.now(timezone.utc)
    current_time = utc_time.strftime("%A %d %B %Y, %I:%M %p")
    
    results = []
    
    # ✅ Loop ដើម្បី Update ម្តងមួយៗ
    for notif in query_notifications:
        notif.is_read = True
        notif.read_at = current_time
        db.add(notif)
        
        results.append(NotificationReadScheme(
            user_id=user_id,
            notification_id=notif.notification_id,
            gmail=gmail,
            read_at=notif.read_at,
            is_read=True,
            account_type=account_type,
        ))

    await db.commit()
    response_detail = "Reading all notification was success✅ !" if notif.is_read  else "Unreading all notification was success✅ !"
    return NotificationReadAllResponse(detail=response_detail, read_notif_info=results)
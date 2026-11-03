import uuid
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from Service.favorite_list import verify_user
from fastapi import APIRouter,status,Depends,HTTPException
from typing import Annotated
from Database.database import get_session,get_application
from Database.model_application import NotificationUser 
from Database.model_account import UserSignIn, GoogleSignIn, FacebookSignIn, GithubSignIn
from pydantic import BaseModel
router = APIRouter()

class Notification_Update(BaseModel):
        notification_id: str
        title:str
        message:str
        type:str
        color:str
        sended_at:str
        time_live:int
        account_type: str
        gmail: str
        
class Welcome_Response(BaseModel):
    detail: str
    notifcation_info: Notification_Update
    
async def return_username(db_user:AsyncSession,user_id:int,gmail:str,account_type:str):
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

    
@router.post("/weather_notification_update",status_code=status.HTTP_200_OK,response_model = Welcome_Response)
async def send_Update_notification(
    db:Annotated[AsyncSession,Depends(get_application)],
    db_user: Annotated[AsyncSession, Depends(get_session)],
    user_id:int,
    gmail: str,
    account_type: str
    ):
    """
    Creates and saves a update notification to the database for a newly authenticated user.
    """
    await verify_user(db_user,user_id,gmail,account_type)
    user = await return_username(db_user,user_id,gmail,account_type)
    notification_id = str(uuid.uuid4())

    # 2. Get current full date and local time format (e.g., "Friday 30 October 2026, 04:51 PM")
    current_time_utc = datetime.now(timezone.utc)
    # You can also format this using your existing format_datetime helper if needed
    formatted_date_time = current_time_utc.strftime("%A %d %B %Y, %I:%M %p")

    # 3. Build the notification payload matching your JSON requirements
    title = "The New System update!"
    message = (
        f"Hello {user.username}👋🏻! We're adding more feature, fixing bugs, upgrading security, and we also optimize the speed here"
        "So keep enjoying your city search and have more fun of music and feature !."
    )
    notification_type = "update"
    color = "green"
    time_live = 7  # Active for 7 days
    
    query_notif_update = (await db.scalars(select(NotificationUser).where((NotificationUser.gmail == gmail)  & (NotificationUser.account_type == account_type)))).first()
   
    new_notification = NotificationUser(
            gmail=gmail,
            title=title,
            is_read=False,
            notification_id=notification_id,
            time_live=time_live,
            account_type=account_type,
            sended_at=current_time_utc,
            type_msg=notification_type,
            color=color,  
        )

    db.add(new_notification)
    await db.commit()
    result_response = Notification_Update(
            notification_id= notification_id,
            title= title,
            message= message,
            type= notification_type,
            color= color,
            gmail= gmail,
            sended_at= formatted_date_time,
            time_live= time_live,
            account_type= account_type,
    )
    return Welcome_Response(
        detail = "Sending Update's notification was success! ✅",
        notifcation_info=result_response,
    )
    
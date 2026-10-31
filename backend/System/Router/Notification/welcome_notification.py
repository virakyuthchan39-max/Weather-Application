import uuid
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from Service.favorite_list import verify_user
from fastapi import APIRouter,status,Depends,HTTPException
from typing import Annotated
from Database.database import get_session,get_application
from Database.model_application import NotificationUser # Assuming this is your model path
from Database.model_account import UserSignIn, GoogleSignIn, FacebookSignIn, GithubSignIn
from pydantic import BaseModel
router = APIRouter()

class Notification_Welcome(BaseModel):
        notification_id: str
        title:str
        message:str
        type:str
        color:str
        sended_at:str
        time_live:int
        account_type: str
        gmail: str
        
class  Welcome_Response(BaseModel):
    detail: str
    notifcation_info: Notification_Welcome
    
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

    
@router.post("/welcome_notification_signin",status_code=status.HTTP_200_OK,response_model = Welcome_Response)
async def send_welcome_notification(
    db:Annotated[AsyncSession,Depends(get_application)],
    db_user: Annotated[AsyncSession, Depends(get_session)],
    user_id:int,
    gmail: str,
    account_type: str
    ):
    """
    Creates and saves a welcome notification to the database for a newly authenticated user.
    """
    await verify_user(db_user,user_id,gmail,account_type)
    user = await return_username(db_user,user_id,gmail,account_type)
    notification_id = str(uuid.uuid4())

    # 2. Get current full date and local time format (e.g., "Friday 30 October 2026, 04:51 PM")
    current_time_utc = datetime.now(timezone.utc)
    # You can also format this using your existing format_datetime helper if needed
    formatted_date_time = current_time_utc.strftime("%A %d %B %Y, %I:%M %p")

    # 3. Build the notification payload matching your JSON requirements
    title = "Account Acception !"
    message = (
        f"Congratulation {user.username} ! you had been passing the account authication. "
        "in addiction you can enjoy in this application. however we had been developed "
        "it for 3 weeks just for learning. it sometime had the secret bug. that it! "
        "Please contact us if something went wrong! (Click the button)"
    )
    notification_type = "welcome_signin"
    color = "green"
    time_live = 7  # Active for 7 days
    query_notification_signin = (await db.scalars(select(NotificationUser).where((NotificationUser.gmail == gmail) & (NotificationUser.type_msg == notification_type)))).first()
    if query_notification_signin:
        query_notification_signin.sended_at = current_time_utc.strftime("%A %d %B %Y, %I:%M %p")
        query_notification_signin.is_read = False
        query_notification_signin.time_live=7
        new_notification = query_notification_signin
        db.add(new_notification)
    else:
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
    result_response = Notification_Welcome(
            notification_id= notification_id,
            title= title,
            gmail=gmail,
            message= message,
            type= notification_type,
            color= color,
            sended_at= formatted_date_time,
            time_live= time_live,
            account_type= account_type,
           
    )

    return Welcome_Response(
        detail = "Sending Welcome's notification was success! ✅",
        notifcation_info=result_response,
    )
    
    
@router.post("/welcome_notification_login",status_code=status.HTTP_200_OK,response_model = Welcome_Response)
async def send_welcome_notification(
    db:Annotated[AsyncSession,Depends(get_application)],
    db_user: Annotated[AsyncSession, Depends(get_session)],
    user_id:int,
    gmail: str,
    account_type: str
    ):
    """
    Creates and saves a welcome notification to the database for a newly authenticated user.
    """
    await verify_user(db_user,user_id,gmail,account_type)
    user =  await return_username(db_user,user_id,gmail,account_type)
    notification_id = str(uuid.uuid4())

    # 2. Get current full date and local time format (e.g., "Friday 30 October 2026, 04:51 PM")
    current_time_utc = datetime.now(timezone.utc)
    # You can also format this using your existing format_datetime helper if needed
    formatted_date_time = current_time_utc.strftime("%A %d %B %Y, %I:%M %p")

    # 3. Build the notification payload matching your JSON requirements
    title = "Account Recallation !"
    message = (
        f"Welcome back {user.username} !. "
        "in addiction you can enjoy in this application. however we had been developed "
        "it for 3 weeks just for learning. it sometime had the secret bug. that it! "
        "Please contact us if something went wrong! (Click the button)"
    )
    notification_type = "welcome_login"
    color = "green"
    time_live = 7  # Active for 7 days
    query_notification_login = (await db.scalars(select(NotificationUser).where((NotificationUser.gmail == gmail) & (NotificationUser.type_msg == notification_type)))).first()
    if query_notification_login:
        query_notification_login.sended_at = current_time_utc.strftime("%A %d %B %Y, %I:%M %p")
        query_notification_login.is_read = False
        query_notification_login.time_live=7
        new_notification = query_notification_login
        db.add(new_notification)
    else:
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
    result_response = Notification_Welcome(
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
        detail = "Sending Welcome's notification was success! ✅",
        notifcation_info=result_response,
    )    
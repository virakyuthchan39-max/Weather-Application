import uuid
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from Service.favorite_list import verify_user
from fastapi import APIRouter,status,Depends,HTTPException
from typing import Annotated
from Database.database import get_session,get_application
from Router.OpenWeather.open_weather import WeatherResponse
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
def generate_weather_alert_content(weather_data: WeatherResponse):
    """
    Analyzes weather data (wind gust, speed, climate) and categorizes 
    the notification message dynamically.
    """
    weather = weather_data.weather
    climate = weather.climate.lower() if weather.climate else ""
    wind = weather.wind
    wind_speed = wind.speed if wind and wind.speed else 0
    wind_gust = wind.gust if wind and wind.gust else 0

    # 1. Insane Wind / Severe Gusts Alert
    if wind_gust > 15 or wind_speed > 12:  # Thresholds can be adjusted based on your unit scale (m/s)
        return {
            "title": "Wind Alert! 💨",
            "message": f"Danger! High-speed winds and gusts (Speed: {wind_speed}, Gust: {wind_gust}) detected in your area. Please secure outdoor property and drive carefully on the road.",
            "type": "alert",
            "color": "yellow"
        }
    
    # 2. Blizzard / Heavy Snow Alert
    elif "snow" in climate and (wind_speed > 8 or wind_gust > 10):
        return {
            "title": "Blizzard Warning! ❄️",
            "message": "Extreme snow conditions and low visibility detected. A blizzard is forming in your region. Stay indoors if possible and keep warm!",
            "type": "alert",
            "color": "yellow"
        }
    
    # 3. Heavy Rain / Thunderstorm & Flood Warning
    elif "rain" in climate or "thunderstorm" in climate:
        return {
            "title": "Heavy Rain & Flood Warning! 🌧️",
            "message": "Heavy rain and potential thunderstorms are active. This may cause uncomfortable travel conditions and localized flooding around your home. Stay safe!",
            "type": "alert",
            "color": "yellow"
        }
    
    # 4. Default / Normal Welcome / Status Update
    else:
        return {
            "title": "Weather Status is Stable ⛅",
            "message": "Weather conditions in your area are currently normal and stable. Enjoy your day and check back for live updates!",
            "type": "info",
            "color": "green"
        }
    
@router.post("/weather_notification_alert", status_code=status.HTTP_200_OK, response_model=Welcome_Response)
async def send_alert_notification(
    db: Annotated[AsyncSession, Depends(get_application)],
    db_user: Annotated[AsyncSession, Depends(get_session)],
    user_id: int,
    gmail: str,
    account_type: str,
    weather_payload: WeatherResponse
):
    """
    Creates and saves a categorized weather alert notification to the database based on live weather data.
    """
    await verify_user(db_user, user_id, gmail, account_type)
    user = await return_username(db_user, user_id, gmail, account_type)
    
    notification_id = str(uuid.uuid4())
    current_time_utc = datetime.now(timezone.utc)
    formatted_date_time = current_time_utc.strftime("%A %d %B %Y, %I:%M %p")

    # Generate dynamic content using our analyzer function
    alert_info = generate_weather_alert_content(weather_payload)
    
    title = alert_info["title"]
    message = alert_info["message"]
    notification_type = alert_info["type"]
    color = alert_info["color"]
    time_live = 7  # Active for 7 days

    new_notification = NotificationUser(
        gmail=gmail,
        title=title,
        is_read=False,
        time_live=time_live,
        notification_id=notification_id,
        account_type=account_type,
        sended_at=current_time_utc,
        type_msg=notification_type,
        color=color,  
    )

    # Save to Database
    db.add(new_notification)
    await db.commit()

    result_response = Notification_Welcome(
        notification_id=notification_id,
        title=title,
        message=message,
        type=notification_type,
        color=color,
        sended_at=formatted_date_time,
        time_live=time_live,
        account_type=account_type,
        gmail=gmail
    )

    return Welcome_Response(
        detail="Weather notification successfully generated and sent! ✅",
        notifcation_info=result_response,
    )
    
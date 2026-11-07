from fastapi import APIRouter, Depends, status, HTTPException, Request
from pydantic import BaseModel, EmailStr
from typing import Annotated, List
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from datetime import datetime, timezone, timedelta
import uuid
import httpx

from Database.database import get_session,get_application
from .temperature import TemperatureSchema, convert_temperature
from Router.Account.logout_ThirdParty import Check_Valid_Token
from Database.model_account import UserSignIn, GoogleSignIn, FacebookSignIn, GithubSignIn
from Database.model_application import FavoriteCity
from fastapi.security import HTTPAuthorizationCredentials,HTTPBearer

# ---------- Pydantic Models ----------
class FavoriteAddRequest(BaseModel):
    user_id: int
    account_type: str = "Regular"
    email: EmailStr
    city: str
    daytime: str
    climate: str
    wind_speed: float
    lon: float = 0
    lat: float = 0
    temp: TemperatureSchema
    country: str
    country_code: str = ""
    offset: int = 0

class FavoriteSchemes(BaseModel):
    fav_id: str
    user_id: int
    city: str
    lon: float = 0
    lat: float = 0
    daytime: str
    climate: str
    country: str
    wind_speed: float
    country_code: str
    offset: int = 0
    temp: TemperatureSchema
    time: str
    full_date: str

class FavoriteResponse(BaseModel):
    detail: str = "Check favorite's city list was success !✅"
    fav_list: List[FavoriteSchemes]

class DeleteResponse(BaseModel):
    detail: str = "Delete favorite's city list was success !✅"
    fav_delete: List[FavoriteSchemes]

router = APIRouter()
security = HTTPBearer()

async def verify_user(db: AsyncSession, user_id: int, email: str, account_type: str):
    acc_type = account_type.lower()
    
    if acc_type == "regular":
        stmt = select(UserSignIn).where((UserSignIn.id == user_id) & (UserSignIn.gmail == email))
    elif acc_type == "google":
        stmt = select(GoogleSignIn).where((GoogleSignIn.id == user_id) & (GoogleSignIn.gmail == email))
    elif acc_type == "facebook":
        stmt = select(FacebookSignIn).where((FacebookSignIn.id == user_id) & (FacebookSignIn.gmail == email))
    elif acc_type == "github":
        stmt = select(GithubSignIn).where((GithubSignIn.id == user_id) & (GithubSignIn.gmail == email))
    else:
        raise HTTPException(detail="Invalid account type!", status_code=status.HTTP_400_BAD_REQUEST)

    result = await db.scalars(stmt)
    user = result.first()
    if not user:
        raise HTTPException(detail=f"This {account_type} account isn't found!", status_code=status.HTTP_404_NOT_FOUND)
    return user

def map_to_schema(db_fav: FavoriteCity) -> FavoriteSchemes:
    return FavoriteSchemes(
        fav_id=db_fav.fav_id,
        user_id=db_fav.user_id,
        city=db_fav.city,
        lon=db_fav.lon,
        lat=db_fav.lat,
        daytime=db_fav.daytime,
        climate=db_fav.climate,      
        country=db_fav.country,
        wind_speed=db_fav.wind_speed,
        country_code=db_fav.country_code,
        offset=db_fav.offset,
        temp=TemperatureSchema(
            kelvin=db_fav.temp_kelvin,
            celsius=db_fav.temp_celsius,
            fahrenheit=db_fav.temp_fahrenheit,
            feel_like_celsius=db_fav.feel_like_celsius,
            feel_like_level=db_fav.feel_like_level,
            feel_like_farhrenheit=db_fav.feel_like_fahreheit,
            feel_like_kelvin=db_fav.feel_like_kelvin,
            pressure=db_fav.pressure,
            visibility=db_fav.visibility,
            humidity=db_fav.humidity
        ),
        time=db_fav.time,
        full_date=db_fav.full_date
    )

@router.post("/favorite_add", status_code=status.HTTP_200_OK, response_model=FavoriteResponse)
async def Favorite_City(
    input: FavoriteAddRequest, 
    request: Request,
    db_user: Annotated[AsyncSession , Depends(get_session)],
    db: Annotated[AsyncSession, Depends(get_application)]
):
    await verify_user(db_user, input.user_id, input.email, input.account_type)

    # IP Time Logic
    formatted_time = datetime.now(timezone.utc).strftime("%I:%M %p")
    formatted_date = datetime.now(timezone.utc).strftime("%a, %d %b %Y")
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.get("https://ipwho.is/")
            data = res.json()
            if "timezone" in data:
                offset_seconds = data["timezone"].get("offset", 0)
                local_now = datetime.now(timezone.utc) + timedelta(seconds=offset_seconds)
                formatted_time = local_now.strftime("%I:%M %p")
                formatted_date = local_now.strftime("%a, %d %b %Y")
    except Exception as e:
        print(f"IP lookup failed: {e}")

    result_temp = convert_temperature(
        input.temp.kelvin,
        humidity=input.temp.humidity,
        visibility=input.temp.visibility,
        pressure=input.temp.pressure,
        feel_like=input.temp.feel_like_kelvin
    )

    existing_fav_result = await db.scalars(
        select(FavoriteCity)
        .where(FavoriteCity.user_id == input.user_id)
        .where(FavoriteCity.city == input.city)
        .where(FavoriteCity.country == input.country)
    )
    existing_fav = existing_fav_result.first()

    if existing_fav:
  
        existing_fav.daytime = input.daytime
        existing_fav.climate = input.climate
        existing_fav.wind_speed = input.wind_speed
        existing_fav.offset = input.offset
        existing_fav.time = formatted_time
        existing_fav.full_date = formatted_date
        
        # Update សីតុណ្ហភាព
        existing_fav.temp_kelvin = result_temp.kelvin
        existing_fav.temp_celsius = result_temp.celsius
        existing_fav.temp_fahrenheit = result_temp.fahrenheit
        existing_fav.feel_like_celsius = result_temp.feel_like_celsius
        existing_fav.feel_like_level = result_temp.feel_like_level
        existing_fav.feel_like_fahreheit = result_temp.feel_like_farhrenheit
        existing_fav.feel_like_kelvin = result_temp.feel_like_kelvin
        existing_fav.pressure = result_temp.pressure
        existing_fav.visibility = result_temp.visibility
        existing_fav.humidity = result_temp.humidity
        
        db.add(existing_fav)
    else:
        # បើគ្មាន -> បង្កើតថ្មី
        add_fav_city = FavoriteCity(
            fav_id=str(uuid.uuid4()),
            user_id=input.user_id,
            account_type=input.account_type,
            gmail=input.email,
            city=input.city,
            country=input.country,
            country_code=input.country_code,
            lon=input.lon,
            lat=input.lat,
            daytime=input.daytime,
            climate=input.climate,
            wind_speed=input.wind_speed,
            offset=input.offset,
            time=formatted_time,
            full_date=formatted_date,
            temp_kelvin=result_temp.kelvin,
            temp_celsius=result_temp.celsius,
            temp_fahrenheit=result_temp.fahrenheit,
            feel_like_celsius=result_temp.feel_like_celsius,
            feel_like_level=result_temp.feel_like_level,
            feel_like_fahreheit=result_temp.feel_like_farhrenheit,
            feel_like_kelvin=result_temp.feel_like_kelvin,
            pressure=result_temp.pressure,
            visibility=result_temp.visibility,
            humidity=result_temp.humidity
        )
        db.add(add_fav_city)
        
    await db.commit()
    
    all_favs = await db.scalars(select(FavoriteCity).where(FavoriteCity.user_id == input.user_id))
    
    fav_list = [map_to_schema(f) for f in all_favs.all()]
    
    return FavoriteResponse(fav_list=fav_list)


@router.get("/favorite_list", status_code=status.HTTP_200_OK, response_model=FavoriteResponse)
async def Favorite_List(
    user_id: int, 
    email: EmailStr, 
    account_type: str = "Regular",
    db_user: AsyncSession = Depends(get_session),
    db: AsyncSession = Depends(get_application),
  
):
    await verify_user(db_user, user_id, email, account_type)

    # Fetch from Database
    all_favs = await db.scalars(select(FavoriteCity).where(FavoriteCity.user_id == user_id))
    fav_list = [map_to_schema(f) for f in all_favs.all()]
    
    return FavoriteResponse(fav_list=fav_list)


@router.delete("/favorite_delete/{fav_id}", response_model=DeleteResponse, status_code=status.HTTP_200_OK)
async def Delete_favorite(
    fav_id: str,
    user_id: int, 
    email: EmailStr, 
    account_type: str = "Regular",
    db_user: AsyncSession = Depends(get_session),
    db: AsyncSession = Depends(get_application),
    credential: HTTPAuthorizationCredentials = Depends(security)
):
    await verify_user(db_user, user_id, email, account_type)
    await Check_Valid_Token(credential)

    # Find the specific city in the Database
    target = await db.scalars(
        select(FavoriteCity)
        .where(FavoriteCity.fav_id == fav_id)
        .where(FavoriteCity.user_id == user_id)
    )
    target_fav = target.first()
    
    if not target_fav:
        raise HTTPException(detail="Favorite city not found!", status_code=status.HTTP_404_NOT_FOUND)

    # Delete from Database
    await db.delete(target_fav)
    await db.commit()

    return DeleteResponse(fav_delete=[map_to_schema(target_fav)])


@router.delete("/favorite_delete_all", status_code=status.HTTP_200_OK, response_model=DeleteResponse)
async def Delete_favorite_all(
    user_id: int, 
    email: EmailStr,
    account_type: str = "Regular",
    db_user: AsyncSession = Depends(get_session),
    db: AsyncSession = Depends(get_application),
    credential: HTTPAuthorizationCredentials = Depends(security)
):
    await verify_user(db_user, user_id, email, account_type)
    await Check_Valid_Token(credential)

    # Find all favorites for this user
    all_favs = await db.scalars(select(FavoriteCity).where(FavoriteCity.user_id == user_id))
    favs_to_delete = all_favs.all()
    
    # Delete each one
    for fav in favs_to_delete:
        await db.delete(fav)
    await db.commit()

    return DeleteResponse(
        detail="All favorite cities deleted successfully! ✅",
        fav_delete=[map_to_schema(f) for f in favs_to_delete]
    )
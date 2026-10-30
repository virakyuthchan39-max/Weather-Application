from fastapi import APIRouter, Depends, status, HTTPException, Request
from pydantic import BaseModel, EmailStr, Field
from typing import Annotated, List, Optional
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from datetime import datetime, timezone,timedelta
import uuid
import httpx

from Database.database import get_session
from .temperature import TemperatureSchema,classify_level,classify_feel_like_level,convert_temperature
from Database.model_account import UserLogin, UserSignIn, GoogleSignIn, FacebookSignIn, GithubSignIn

# ---------- Pydantic Models ----------
class FavoriteAddRequest(BaseModel):
    user_id: int
    account_type: str = "Regular"
    email: EmailStr
    city: str
    daytime: str
    climate: str
    wind_speed: float
    temp: TemperatureSchema
    country: str
    country_code: str = "" # ✅ Default to empty string for Antarctica
    offset: int = 0        # ✅ ADDED: Required for frontend timezone calculation

class FavoriteSchemes(BaseModel):
    fav_id: str
    user_id: int
    city: str
    daytime: str
    climate: str
    country: str
    wind_speed: float
    country_code: str
    offset: int = 0        # ✅ ADDED: Required for frontend timezone calculation
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

# In-memory storage
fav_data = {} 

async def verify_user(db: AsyncSession, user_id: int, email: str, account_type: str):
    acc_type = account_type.lower()
    
    # ✅ FIXED: Use & instead of 'and' for SQLAlchemy conditions
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
        raise HTTPException(
            detail=f"This {account_type} account isn't found!", 
            status_code=status.HTTP_404_NOT_FOUND
        )
    
    return user


@router.post("/favorite_add", status_code=status.HTTP_200_OK, response_model=FavoriteResponse)
async def Favorite_City(
    input: FavoriteAddRequest, 
    request: Request,
    db: Annotated[AsyncSession, Depends(get_session)]
):
    await verify_user(db, input.user_id, input.email, input.account_type)

    client_ip = request.headers.get("x-forwarded-for")
    if client_ip:
        client_ip = client_ip.split(",")[0].strip()
    else:
        client_ip = request.client.host

    formatted_time = datetime.now(timezone.utc).strftime("%H:%M %p")
    formatted_date = datetime.now(timezone.utc).strftime("%d %b %Y")
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
    
    new_fav = FavoriteSchemes(
        fav_id=str(uuid.uuid4()),
        user_id=input.user_id,
        city=input.city,
        country=input.country,
        country_code=input.country_code,
        daytime=input.daytime,
        climate=input.climate,
        wind_speed=input.wind_speed,
        offset=input.offset, # ✅ SAVED: Now it will return to frontend correctly
        temp=result_temp,
        time=formatted_time,
        full_date=formatted_date,
    )

    if input.user_id not in fav_data:
        fav_data[input.user_id] = []
    fav_data[input.user_id].append(new_fav)
    
    return FavoriteResponse(fav_list=fav_data[input.user_id])


@router.get("/favorite_list", status_code=status.HTTP_200_OK, response_model=FavoriteResponse)
async def Favorite_List(
    user_id: int, 
    email: EmailStr, 
    account_type: str = "Regular",
    db: AsyncSession = Depends(get_session)
):
    await verify_user(db, user_id, email, account_type)
    user_favorites = fav_data.get(user_id, [])
    return FavoriteResponse(fav_list=user_favorites)


@router.delete("/favorite_delete/{fav_id}", response_model=DeleteResponse, status_code=status.HTTP_200_OK)
async def Delete_favorite(
    fav_id: str,
    user_id: int, 
    email: EmailStr, 
    account_type: str = "Regular",
    db: AsyncSession = Depends(get_session)
):
    await verify_user(db, user_id, email, account_type)

    user_favs = fav_data.get(user_id, [])
    target_fav = [f for f in user_favs if f.fav_id == fav_id]
    if not target_fav:
        raise HTTPException(detail="Favorite city not found!", status_code=status.HTTP_404_NOT_FOUND)

    fav_data[user_id] = [f for f in user_favs if f.fav_id != fav_id]
    return DeleteResponse(fav_delete=target_fav)


@router.delete("/favorite_delete_all", status_code=status.HTTP_200_OK, response_model=DeleteResponse)
async def Delete_favorite_all(
    user_id: int, 
    email: EmailStr,
    account_type: str = "Regular",
    db: AsyncSession = Depends(get_session)
):
    await verify_user(db, user_id, email, account_type)

    user_favs = fav_data.get(user_id, [])
    fav_data[user_id] = []

    return DeleteResponse(
        detail="All favorite cities deleted successfully! ✅",
        fav_delete=user_favs
    )
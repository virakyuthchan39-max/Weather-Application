from fastapi import APIRouter, Depends, status, HTTPException, Request
from pydantic import BaseModel, EmailStr, Field
from typing import Annotated, List
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
from datetime import datetime, timezone,timedelta
from zoneinfo import ZoneInfo
import uuid
import httpx

from Database.database import get_session
from Database.model import UserLogin, UserSignIn, GoogleSignIn, FacebookSignIn, GithubSignIn
# ---------- Pydantic Models ----------
class FavoriteAddRequest(BaseModel):
    user_id: int
    account_type: str = "Regular"
    email: EmailStr
    city: str
    country: str
    country_code: str

class FavoriteSchemes(BaseModel):
    fav_id: str
    user_id: int
    city: str
    country: str
    country_code: str
    time: str

class FavoriteResponse(BaseModel):
    detail: str = "Check favorite's city list was success !✅"
    fav_list: List[FavoriteSchemes]

class DeleteResponse(BaseModel):
    detail: str = "Delete favorite's city list was success !✅"
    fav_delete: List[FavoriteSchemes]

router = APIRouter()


# In-memory storage (ក្រោយមកគួរប្តូរទៅ Database ពិតប្រាកដ)
fav_data = {} 

async def verify_user(db: AsyncSession, user_id: int, email: str, account_type: str):
    acc_type = account_type.lower()
    
    if acc_type == "regular":
        stmt = select(UserSignIn).where(UserSignIn.id == user_id and UserSignIn.gmail == email)
    elif acc_type == "google":
        stmt = select(GoogleSignIn).where(GoogleSignIn.id == user_id and GoogleSignIn.gmail == email)
    elif acc_type == "facebook":
        stmt = select(FacebookSignIn).where(FacebookSignIn.id == user_id and FacebookSignIn.gmail == email)
    elif acc_type == "github":
        stmt = select(GithubSignIn).where(GithubSignIn.id == user_id and GithubSignIn.gmail == email)
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
    # ១. ពិនិត្យថាតើ User មានពិតឬអត់
    await verify_user(db, input.user_id, input.email, input.account_type)

    # ២. ទាញយក IP របស់ Client
    client_ip = request.headers.get("x-forwarded-for")
    if client_ip:
        client_ip = client_ip.split(",")[0].strip()
    else:
        client_ip = request.client.host

    # ៣. ទាញយកម៉ោងមូលដ្ឋានតាម IP (ipwho.is)
    formatted_time = datetime.now(timezone.utc).strftime("%H:%M %p") # Default fallback
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            # បើ IP ជា localhost ទើបហៅ API ធម្មតា ដើម្បីទាញ IP សាធារណៈរបស់ Server
            res = await client.get( "https://ipwho.is/")
            data = res.json()
          
            if "timezone" in data:
                offset_seconds = data["timezone"].get("offset", 0)
                # គណនាម៉ោងតាម Timezone របស់ User
                local_now = datetime.now(timezone.utc) + timedelta(seconds=offset_seconds)
                formatted_time = local_now.strftime("%I:%M %p")
    except Exception as e:
        print(f"IP lookup failed: {e}")

    # ៤. បង្កើត ID ថ្មីសម្រាប់ Favorite នេះ
    new_fav = FavoriteSchemes(
        fav_id=str(uuid.uuid4()),
        user_id=input.user_id,
        city=input.city,
        country=input.country,
        country_code= input.country_code,
        time=formatted_time
    )

    # ៥. បន្ថែមទៅក្នុង List របស់ User នោះ
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
    # ពិនិត្យ User ជាមុនសិន
    await verify_user(db, user_id, email, account_type)
    
    # ទាញយក List តាម user_id
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
    
    # ស្វែងរកធាតុដែលត្រូវលុប
    target_fav = [f for f in user_favs if f.fav_id == fav_id]
    if not target_fav:
        raise HTTPException(detail="Favorite city not found!", status_code=status.HTTP_404_NOT_FOUND)

    # លុបចេញពី List
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
    
    # លុបទាំងអស់ចេញពី List របស់ User នេះ
    fav_data[user_id] = []

    return DeleteResponse(
        detail="All favorite cities deleted successfully! ✅",
        fav_delete=user_favs
    )
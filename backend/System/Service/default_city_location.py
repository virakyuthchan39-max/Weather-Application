import httpx
from fastapi import APIRouter, Request, status
from pydantic import BaseModel

router = APIRouter()

class LocationSchema(BaseModel):
    
    city: str
    lat:float
    lon: float
    location: str

class DefaultLocationResponse(BaseModel):
    location: LocationSchema

@router.get("/default_location", response_model=DefaultLocationResponse)
async def get_default_location(request: Request):
    # ១. កំណត់តម្លៃ Default ទុកជាមុន ធានាថាមិនបាត់តម្លៃ
    city = "New York"
    country = "United State"
    lat= 0
    lon = 0
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            res = await client.get("https://ipwho.is/")
            if res.status_code == status.HTTP_200_OK:
                data = res.json()
                # យកតម្លៃពី API បើមាន បើអត់មានប្រើ Default
                lat= data.get("latitude",0)
                 # យកតម្លៃពី API បើមាន បើអត់មានប្រើ Default
                lon = data.get("longitude",0)
                city = data.get("city") or "N/A"
                country = data.get("country") or "N/A"         
    except Exception:
        pass
    return DefaultLocationResponse(
        location=LocationSchema(city=city, lat=lat,lon=lon,location=country)
    )
import os
import httpx
from fastapi import APIRouter, status, Request, Query, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
from pathlib import Path
import pycountry
import asyncio
from typing import Annotated
from slowapi import Limiter
from slowapi.util import get_remote_address
from .timezone import format_datetime, DateTimeSchema
from .daytime import get_detailed_time_phase
from Memory.localStorage import cache_get, cache_set
from Router.OpenWeather.open_weather import clean_country_name,clean_territory_name
limiter = Limiter(key_func=get_remote_address)

# ---------- Load env ----------
root_dir = Path(__file__).resolve().parent
env_path = root_dir / "DevOp" / ".env.api"
load_dotenv(dotenv_path=env_path)

OPEN_WEATHER_API_KEY = os.getenv("OPEN_WEATHER_API_KEY", "")
WEATHER_CACHE_TTL = os.getenv("WEATHER_CACHE_TTL",600)
OPEN_WEATHER_GEO_URL = "https://api.openweathermap.org/geo/1.0/direct"
OPEN_WEATHER_WEATHER_URL = "https://api.openweathermap.org/data/2.5/weather"

# ---------- Schemas ----------
class SimilarSchemes(BaseModel):
    city: str
    country: str
    country_code: str
    lat:float
    lon:float
    type: str
    timezone: DateTimeSchema
    daytime: str

class SimilarResponse(BaseModel):
    detail: str = "We found the similar city name in another different region successfully ✅!"
    city_list_info: list[SimilarSchemes]

router = APIRouter()

def convert_country_name(code: str):
    if not code or code == "N/A":
        return "N/A"
    country = pycountry.countries.get(alpha_2=code.upper())
    if country:
        raw_name = getattr(country, "common_name", country.name)
        return clean_country_name(raw_name)
    return code

@router.get("/similar_city", status_code=status.HTTP_200_OK, response_model=SimilarResponse)
@limiter.limit("50/minute")
async def Finding_Similar_City(
    request: Request,
    city: Annotated[str, Query(min_length=1, description="City name to find across regions")],
):
    # 1. Fetch matching locations using Geocoding API (returns lat and lon)

      
    cache_key = f"weather:{city.lower()}"
    cached = await cache_get(cache_key)
    if cached:
        try:   
            return SimilarResponse(**cached)
        except Exception:
            pass
    geo_params = {
        "q": city,
        "limit": 10,
        "appid": OPEN_WEATHER_API_KEY,
    }
    
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.get(OPEN_WEATHER_GEO_URL, params=geo_params)
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Geo service unreachable: {e}",
        )

    if res.status_code != status.HTTP_200_OK:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"OpenWeather Geo error ({res.status_code}): {res.text}",
        )
    data = res.json()
    if not data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No similar cities found for '{city}'.",
        )

    # Helper function to fetch real-time weather/timezone data using lat and lon
    async def fetch_city_details(client: httpx.AsyncClient, item: dict):
  
        c_name =  item.get("name", "N/A")
        country_code = item.get("country", "N/A")
        raw_name = item.get("state","")

        
        state_name = clean_territory_name(raw_name)
        formatted_country = convert_country_name(country_code)
   
        lat = item.get("lat")
        lon = item.get("lon")

        # Fallback default values if lat/lon are missing
        tz_offset = 0
        dt_time = 0
        if lat is not None and lon is not None:
            weather_params = {
                "lat": lat,
                "lon": lon,
                "appid": OPEN_WEATHER_API_KEY,
            }
            try:
                w_res = await client.get(OPEN_WEATHER_WEATHER_URL, params=weather_params)
                if w_res.status_code == status.HTTP_200_OK:
                    w_data = w_res.json()
                    tz_offset = w_data.get("timezone", 0)
                    dt_time = item.get("dt",0)
            except Exception:
                pass

        dt = format_datetime(tz_offset,offset=tz_offset,dt=dt_time)
        daytime = get_detailed_time_phase(dt.hour)
        return {
            "unique_key": f"{c_name.lower()}-{formatted_country.lower()}",
            "schema": SimilarSchemes(
                city=c_name,
                type= state_name,
                lat = lat,
                lon = lon,
                country_code = country_code,
                country=formatted_country,
                timezone=dt,
                daytime=daytime
            )
        }
    # 2. Concurrently fetch weather details for all found coordinates using asyncio.gather
    async with httpx.AsyncClient(timeout=5.0) as client:
        tasks = [fetch_city_details(client, item) for item in data]
        results = await asyncio.gather(*tasks)

    city_list = []
    seen = set()

    for result in results:
        if result is None:
            continue
        schema_data = result["schema"]
        city_name= schema_data.city
        if not all(ord(char) < 128  for  char in city_name if char not in " -.,'"):
                    continue
        unique_key = result["unique_key"]
        if unique_key not in seen:
            seen.add(unique_key)
            city_list.append(result["schema"])
     
    response = SimilarResponse(city_list_info=city_list)  
    await cache_set(cache_key, response.model_dump(), ttl=WEATHER_CACHE_TTL)

    return response
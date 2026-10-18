from fastapi import (HTTPException, status, APIRouter, Query,Request)
from pydantic import BaseModel
from dotenv import load_dotenv
from pathlib import Path
import pycountry, asyncio, os, httpx

from Service.temperature import TemperatureSchema, convert_temperature, classify_level
from Service.location import LocationSchema, build_location
from Service.timezone import DateTimeSchema, format_datetime
from Memory.localStorage import cache_get, cache_set
from typing import Annotated
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

# ---------- Load env ----------
root_dir = Path(__file__).resolve().parents[2]
env_path = root_dir / "DevOp" / ".env.api"
load_dotenv(dotenv_path=env_path)

OPEN_WEATHER_API_KEY = os.getenv("OPEN_WEATHER_API_KEY", "")
OPEN_WEATHER_BASE_URL = os.getenv(
    "OPEN_WEATHER_BASE_URL",
    "https://api.openweathermap.org/data/2.5/weather",
)
WEATHER_CACHE_TTL = int(os.getenv("WEATHER_CACHE_TTL", 288))

# ---------- Response schema ----------
class WeatherInfo(BaseModel):
    daytime: str
    climate: str


class WeatherResponse(BaseModel):
    weather: WeatherInfo
    temperature: TemperatureSchema
    level: str
    location: LocationSchema
    datetime: DateTimeSchema


router = APIRouter()


def convert_country_name(code: str):
    if not code or code == "N/A":
        return "N/A"
    country = pycountry.countries.get(alpha_2=code.upper())
    if country:
        return getattr(country, "common_name", country.name)
    return code


# ---------- Service function ----------
async def fetch_weather(city: str, country_code: str = "") -> WeatherResponse:
    query = f"{city},{country_code}" if country_code else city

    # ---------- 1. ពិនិត្យ cache ----------
    cache_key = f"weather:{query.lower()}"
    cached = await cache_get(cache_key)
    if cached:
        return WeatherResponse(**cached)

    params = {
        "q": query,
        "appid": OPEN_WEATHER_API_KEY,
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            res = await client.get(OPEN_WEATHER_BASE_URL, params=params)
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Weather service unreachable: {e}",
        )

    if res.status_code == status.HTTP_404_NOT_FOUND:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"City '{query}' not found.",
        )
    if res.status_code != status.HTTP_200_OK:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"OpenWeather error ({res.status_code}): {res.text}",
        )

    data = res.json()

    # ---------- Extract ----------
    main = data.get("main", {})
    weather_list = data.get("weather", [])
    sys_data = data.get("sys", {})
    tz_offset = data.get("timezone", 0)

    kelvin = float(main.get("temp", 0))
    country_codes = sys_data.get("country", "N/A")
    formatted_country = convert_country_name(country_codes)

    # ---------- Transform ----------
    temperature = convert_temperature(kelvin)
    location = build_location(
        country=formatted_country,
        city=data.get("name", "N/A"),
        territory=sys_data.get("state", ""),
    )
    dt = format_datetime(tz_offset)

    climate = weather_list[0].get("description", "").title() if weather_list else "N/A"
    daytime = "Day" if 6 <=  dt.hour < 18 else "Night"

    response = WeatherResponse(
        weather=WeatherInfo(daytime=daytime, climate=climate),
        temperature=temperature,
        level=classify_level(temperature.celsius),
        location=location,
        datetime=dt,
    )

    # ---------- 2. ដាក់ចូល cache ----------
    await cache_set(cache_key, response.model_dump(), ttl=WEATHER_CACHE_TTL)

    return response



@router.get("/weather", response_model=WeatherResponse)
@limiter.limit("10/minute")
async def get_weather(
    request:Request,
    city: Annotated[str, Query(min_length=1, description="City name or Province name")],
):
    return await fetch_weather(city=city)


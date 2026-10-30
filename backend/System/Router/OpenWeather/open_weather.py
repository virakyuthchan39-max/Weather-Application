from fastapi import (HTTPException, status, APIRouter, Query,Request)
from pydantic import BaseModel
from dotenv import load_dotenv
from pathlib import Path
import pycountry, asyncio, os, httpx


from Service.temperature import TemperatureSchema, convert_temperature, classify_level
from Service.location import LocationSchema, build_location
from Service.timezone import DateTimeSchema, format_datetime
from Memory.localStorage import cache_get, cache_set
from Service.daytime import get_detailed_time_phase
from typing import Annotated,Optional
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

# ---------- Load env ----------
root_dir = Path(__file__).resolve().parents[2]
env_path = root_dir / "DevOp" / ".env.api"
load_dotenv(dotenv_path=env_path)


OPEN_WEATHER_GEO_URL = "https://api.openweathermap.org/geo/1.0/direct"
OPEN_WEATHER_API_KEY = os.getenv("OPEN_WEATHER_API_KEY", "")
OPEN_WEATHER_BASE_URL = os.getenv(
    "OPEN_WEATHER_BASE_URL",
    "https://api.openweathermap.org/data/2.5/weather",
)
WEATHER_CACHE_TTL = int(os.getenv("WEATHER_CACHE_TTL", 288))

# ---------- Response schema ----------
class  WindySchemes(BaseModel):
    gust: float
    speed: float
    deg: int
    direction: str
class WeatherInfo(BaseModel):
    daytime: str
    climate: str
    wind: WindySchemes

class WeatherResponse(BaseModel):
    weather: WeatherInfo
    temperature: TemperatureSchema
    level: str
    location: LocationSchema
    datetime: DateTimeSchema


router = APIRouter()


def clean_territory_name(name: str):
    if not name or name == "N/A":
        return "N/A"

    cleaned = name.strip()

    # 1. Comprehensive Prefixes (Lowercased for matching)
    prefixes_to_remove = [
        "special capital region of ",
        "autonomous region of ",
        "national capital region of ",
        "federal district of ",
        "governorate of ",
        "province of ",
        "republic of ",
        "territory of ",
        "state of ",
        "region of ",
        "municipality of ",
        "prefecture of ",
        "department of ",
        "district of ",
        "county of ",
        "city of ",
        "town of "
    ]

    # Loop and strip prefix case-insensitively
    cleaned_lower = cleaned.lower()
    for prefix in prefixes_to_remove:
        if cleaned_lower.startswith(prefix):
            cleaned = cleaned[len(prefix):].strip()
            cleaned_lower = cleaned.lower()
            break

    # 2. Comprehensive Suffixes
    terms_to_remove = [
        " autonomous region",
        " autonomous republic",
        " administrative region",
        " national capital region",
        " federal district",
        " local municipality",
        " metropolitan borough",
        " municipal corporation",
        " autonomous okrug",
        " autonomous oblast",
        " metropolitan city",
        " prefecture",
        " department",
        " territory",
        " republic",
        " province",
        " governorate",
        " district",
        " subdistrict",
        " region",
        " oblast",
        " okrug",
        " county",
        " parish",
        " borough",
        " division",
        " zone",
        " sector",
        " area",
        " municipality",
        " township",
        " commune",
        " canton",
        " ward",
        " city",
        " town",
        " village",
        " state",
        " kray",
        " krai",
        " raion",
        " rayon",
        " partido",
        " comarca",
        " kreis",
        " landkreis",
        " bezirk",
        " kabupaten",
        " kecamatan",
        " kelurahan",
        " desa",
        " gun",
        " shi",
        " xian",
        " zhen"
    ]

    cleaned_lower = cleaned.lower()
    for term in terms_to_remove:
        if cleaned_lower.endswith(term):
            cleaned = cleaned[: -len(term)].strip()
            cleaned_lower = cleaned.lower()
            break

    return cleaned


def clean_country_name(name: str):
    if not name or name == "N/A":
        return "N/A"
    
    # ១. Mapping ឈ្មោះពិសេសៗដែល pycountry តែងតែចេញមកវែងៗ ឬចង់ប្ដូរតាមចិត្ត
    overrides = {
        "russian federation": "Russia",
        "korea, republic of": "South Korea",
        "korea, democratic people's republic of": "North Korea",
        "venezuela, bolivarian republic of": "Venezuela",
        "iran, islamic republic of": "Iran",
        "syrian arab republic": "Syria",
        "bolivia, plurinational state of": "Bolivia",
        "tanzania, united republic of": "Tanzania",
        "viet nam": "Vietnam",
        "lao people's democratic republic": "Laos",
        "palestine, state of": "Palestine" ,
        "SVALBARD AND JAN MAYEN".lower():"Norway",
    }
    
    name_lower = name.lower().strip()
    if name_lower in overrides:
        return overrides[name_lower]
    
    # ២. កាត់ពាក្យនាំមុខផ្លូវការចេញដោយស្វ័យប្រវត្តិ
    prefixes_to_remove = [
        "republic of ",
        "state of ",
        "islamic republic of ",
        "democratic republic of the ",
        "dem. rep. of the ",
        "commonwealth of "
    ]
    
    cleaned = name
    for prefix in prefixes_to_remove:
        if cleaned.lower().startswith(prefix):
            cleaned = cleaned[len(prefix):]
            break
            
    return cleaned.strip()

def convert_country_name(code: str):
    if not code or code == "N/A":
        return "N/A"
    country = pycountry.countries.get(alpha_2=code.upper())
    if country:
        raw_name = getattr(country, "common_name", country.name)
        return clean_country_name(raw_name)
    return code


def calculate_wind_direction(value:int):
    directions = [
    'North', 'North-Northeast', 'Northeast', 'East-Northeast',
    'East', 'East-Southeast', 'Southeast', 'South-Southeast',
    'South', 'South-Southwest', 'Southwest', 'West-Southwest',
    'West', 'West-Northwest', 'Northwest', 'North-Northwest'
    ]
    index = round((value % 360) /22.5)
    result = directions[index % 16]
    return result

# ---------- Service function ----------
# ---------- Service function ----------
async def fetch_weather(city: str, country_code: str = "", lat: Optional[float] = None, lon: Optional[float] = None) -> WeatherResponse:
    country_code = country_code.strip()

    # 🛠️ កំណត់ Cache Key និង Params ឱ្យត្រូវតាមករណី
    if lat is not None and lon is not None and lat != 0 and lon != 0:
        cache_key = f"weather:lat:{lat}:lon:{lon}"
        weather_params = {
            "lat": lat,
            "lon": lon,
            "appid": OPEN_WEATHER_API_KEY,
        }
        # ប្រើ Reverse Geocoding សម្រាប់ Lat/Lon
        geo_url = "https://api.openweathermap.org/geo/1.0/direct"
        geo_params = {
            "lat": lat,
            "lon": lon,
            "limit": 1,
            "appid": OPEN_WEATHER_API_KEY,
        }
    else:
        query = f"{city},{country_code}" if country_code else city
        cache_key = f"weather:{query.lower()}"
        weather_params = {
            "q": query,
            "appid": OPEN_WEATHER_API_KEY,
        }
        geo_url = OPEN_WEATHER_GEO_URL
        geo_params = {
            "q": query,
            "limit": 1,
            "appid": OPEN_WEATHER_API_KEY,
        }

    # ---------- 1. ពិនិត្យ cache ----------
    cached = await cache_get(cache_key)
    if cached:
       try: 
          return WeatherResponse(**cached)
       except Exception:
            pass

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            res = await client.get(OPEN_WEATHER_BASE_URL, params=weather_params)
            locat = await client.get(geo_url, params=geo_params) 
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Weather service unreachable: {e}",
        )

    if res.status_code == status.HTTP_404_NOT_FOUND:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Location not found for '{city}' {"in " + convert_country_name(country_code) if country_code else ''}",
        )
    if res.status_code != status.HTTP_200_OK:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"OpenWeather error ({res.status_code}): {res.text}",
        )

    data = res.json()
    
    # 🛠️ ពិនិត្យសុវត្ថិភាពទិន្នន័យ Geolocation (ការពារ Index/Key Error)
    state_name = ""
    try:
        data_locat = locat.json()
        if isinstance(data_locat, list) and len(data_locat) > 0:
            raw_state = data_locat[0].get("state", "")
            state_name = clean_territory_name(raw_state)
            
    except Exception:
        pass
    
    # ---------- Extract ----------
    main = data.get("main", {})
    weather_list = data.get("weather", [])
    sys_data = data.get("sys", {})
    tz_offset = data.get("timezone", 0)
    dt_time= data.get("dt",0)
    
    windy_speed= data["wind"].get("speed",0.0)
    windy_degree= data["wind"].get("deg",0)
    windy_gust = data["wind"].get("gust",0.0)
    
    humidity = main.get("humidity",0)
    pressure = main.get("pressure",0)
    visibility = data.get("visibility",0)
    feel_like = main.get("feels_like",0)

    kelvin = float(main.get("temp", 0))
    country_codes = sys_data.get("country", "N/A")

    formatted_country = convert_country_name(country_codes)
   
    # ---------- Transform ----------
    windy = WindySchemes(speed= windy_speed,gust= windy_gust,deg = windy_degree,direction= calculate_wind_direction(windy_degree))
    temperature = convert_temperature(kelvin,humidity=humidity,pressure=pressure,visibility=visibility,feel_like=feel_like)
    location = build_location(
        country=formatted_country,
        city=data.get("name", "N/A"),
        lon=data["coord"].get("lon",0.0),
        lat=data["coord"].get("lat",0.0),
        country_code=country_codes,
        territory=state_name,  # 👈 ប្រើប្រាស់ state ដែលបានទាញយកដោយសុវត្ថិភាព
    )
    dt = format_datetime(tz_offset,offset=tz_offset,dt=dt_time)

    climate = weather_list[0].get("description", "").title() if weather_list else "N/A"
    daytime = get_detailed_time_phase(dt.hour)
   
    response = WeatherResponse(
        weather=WeatherInfo(daytime=daytime, climate=climate,wind=windy),
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
    request: Request,
    city: Annotated[str, Query(min_length=1, description="City name or Province name")],
    country_code: Optional[str] = Query(default="", min_length=0, description="Country code"),
    lat: Optional[float] = Query(default=None, description="Latitude for accurate location"),
    lon: Optional[float] = Query(default=None, description="Longitude for accurate location")
):
   
    return await fetch_weather(city=city, country_code=country_code,lat=lat,lon=lon)


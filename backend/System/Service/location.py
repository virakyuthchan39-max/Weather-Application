from pydantic import BaseModel



class LocationSchema(BaseModel):
    country: str
    city: str

    country_code: str
    territory: str


def build_location(country: str,city: str,country_code: str,territory: str = "") -> LocationSchema:

    return LocationSchema(
        country=country,
        city=city,
        country_code = country_code,
        territory=territory or "N/A",
    )
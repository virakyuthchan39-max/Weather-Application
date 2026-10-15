from pydantic import BaseModel


class LocationSchema(BaseModel):
    country: str
    city: str
    territory: str


def build_location(country: str,city: str,territory: str = "") -> LocationSchema:
    return LocationSchema(
        country=country,
        city=city,
        territory=territory or "N/A",
    )
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel


class DateTimeSchema(BaseModel):
    current_time: str
    local_time: str
    full_date: str
    offset: int
    hour: int
    dt: int

def format_datetime(offset_seconds: int,offset:int,dt:int) -> DateTimeSchema:
    tz = timezone(timedelta(seconds=offset_seconds))
    now = datetime.now(tz)

    return DateTimeSchema(
        current_time=now.strftime("%I:%M %p"),
        local_time = now.strftime("%H:%M %p"),
        full_date=now.strftime("%A, %d %B %Y"),
        offset=offset,
        dt=dt,
        hour = now.hour
    )
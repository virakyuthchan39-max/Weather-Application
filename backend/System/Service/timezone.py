from datetime import datetime, timezone, timedelta
from pydantic import BaseModel


class DateTimeSchema(BaseModel):
    current_time: str
    full_date: str
    hour: int

def format_datetime(offset_seconds: int) -> DateTimeSchema:
    tz = timezone(timedelta(seconds=offset_seconds))
    now = datetime.now(tz)

    return DateTimeSchema(
        current_time=now.strftime("%I:%M:%S %p"),
        full_date=now.strftime("%A %d %B %Y"),
        hour = now.hour
    )
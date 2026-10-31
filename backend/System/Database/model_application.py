
from datetime import datetime, timezone
from typing import Optional, List
from sqlmodel import SQLModel,MetaData, Field, Relationship
from typing import Annotated


    
class FavoriteCity(SQLModel, table=True):
    __tablename__ = "favorite_city"
    
    id: Optional[int] = Field(default=None, primary_key=True, index=True)
    fav_id: Annotated[str, Field(default=None, index=True)]
    
    user_id: Annotated[int, Field(default=None, index=True)]
    account_type: Annotated[str, Field(default=None)]
    gmail: Annotated[str, Field(default=None, index=True)]
    city: Annotated[str, Field(default=None, index=True)]
    country: Annotated[str, Field(default=None, index=True)]
    country_code: Annotated[str, Field(default="")]
    
    lon: Annotated[float, Field(default=0)]
    lat: Annotated[float, Field(default=0)]
    

    daytime: Annotated[str, Field(default=None)]
    climate: Annotated[str, Field(default=None)]
    wind_speed: Annotated[float, Field(default=0)]
    offset: Annotated[int, Field(default=0)]
    time: Annotated[str, Field(default=None)]
    full_date: Annotated[str, Field(default=None)]

    temp_kelvin: Annotated[float, Field(default=0)]
    temp_celsius: Annotated[float, Field(default=0)]
    temp_fahrenheit: Annotated[float, Field(default=0)]
    feel_like_celsius: Annotated[float, Field(default=0)]
    feel_like_level: Annotated[str, Field(default=None)]
    feel_like_fahreheit: Annotated[float, Field(default=0)]
    feel_like_kelvin: Annotated[float, Field(default=0)]
    pressure: Annotated[float, Field(default=0)]
    visibility: Annotated[float, Field(default=0)]
    humidity: Annotated[float, Field(default=0)]
    
class NotificationUser(SQLModel, table=True, ):
    __tablename__ = "notification"
    id: Optional[int] = Field(default=None, primary_key=True, index=True)
    is_read: Annotated[bool,Field(default=False,index=True)]
    title: Annotated[str,Field(default=None)]
    notification_id: Annotated[str,Field(default=None)]
    time_live: Annotated[int,Field(default=None)]
    gmail: Annotated[str,Field(default=None)]
    color: Annotated[str,Field(default=None)]
    account_type: Annotated[str, Field(default=None,index=True)]
    read_at: Optional[datetime] = Field(default=None)
    sended_at: Annotated[str, Field(default_factory=lambda: str(datetime.now(timezone.utc)))]
    type_msg: Annotated[str, Field(default=None)] 


    
class DonationByUser(SQLModel, table=True, ):
    __tablename__ = "donation"
    id: Optional[int] = Field(default=None, primary_key=True, index=True)
    gmail: Annotated[str, Field(default=None,index=True)]
    account_type: Annotated[str, Field(default=None)]
    donated_at:  Annotated[str, Field(default_factory=lambda: str(datetime.now(timezone.utc)))]
    description: Annotated[str,Field(default=None)]
    amount: Annotated[str,Field(default=0)]
    pay_by: Annotated[str,Field(default=None)]
    succeed: Annotated[bool,Field(default=None)]
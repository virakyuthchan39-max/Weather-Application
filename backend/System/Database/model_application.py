
from datetime import datetime, timezone
from typing import Optional, List
from sqlmodel import SQLModel,MetaData, Field, Relationship
from typing import Annotated



class FavoriteCity(SQLModel, table=True, ):
    __tablename__ = "favorite_city"
    
    id: Optional[int] = Field(default=None, primary_key=True, index=True)
    city: Annotated[str, Field(default=None, unique=True)]
    country: Annotated[str, Field(default=None, index=True)]
    gmail: Annotated[str, Field(default=None, unique=True)]
    username: Annotated[str, Field(default=None, index=True)]
    added_at: Annotated[datetime, Field(default_factory=lambda: datetime.now(timezone.utc))]
    account_type: Annotated[str, Field(default=None)]
    
    
class NotificationUser(SQLModel, table=True, ):
    __tablename__ = "notifcation"
    id: Optional[int] = Field(default=None, primary_key=True, index=True)
    gmail: Annotated[str, Field(default=None)]
    account_type: Annotated[str, Field(default=None)]
    sended_at: Annotated[datetime, Field(default_factory=lambda: datetime.now(timezone.utc))]
    type_msg: Annotated[str, Field(default=None)] 



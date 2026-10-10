from datetime import datetime, timezone
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship
from typing import Annotated

class UserSignIn(SQLModel, table=True):
    __tablename__ = "user_signin"

    id: Optional[int] = Field(default=None, primary_key=True, index=True)
    gmail: Annotated[str, Field(default=None, unique=True)]
    username: Annotated[str, Field(default=None, index=True)]
    password: str
    create_at: Annotated[datetime, Field(default_factory=lambda: datetime.now(timezone.utc))]
    is_active: Annotated[bool, Field(default=True)]
    role: Annotated[str, Field(default="user")]

    # Relationships
    logins: List["UserLogin"] = Relationship(back_populates="user")
    logouts: List["UserLogout"] = Relationship(back_populates="user")


class UserLogin(SQLModel, table=True):
    __tablename__ = "user_login"

    id: Optional[int] = Field(default=None, primary_key=True, index=True)
    gmail: Annotated[str, Field(default=None)]
    username: Annotated[str, Field(default=None, index=True)]
    login_at: Annotated[datetime, Field(default_factory=lambda: datetime.now(timezone.utc))]
    is_active: Annotated[bool, Field(default=True)]
    role: Annotated[str, Field(default="user")]

    # Foreign Key → Link to UserSignIn
    register_id: int = Field(default=None, foreign_key="user_signin.id")
    user: Optional[UserSignIn] = Relationship(back_populates="logins")  # 👈 កែត្រង់នេះឱ្យត្រូវគ្នា


class UserLogout(SQLModel, table=True):
    __tablename__ = "user_logout"
    
    id: Optional[int] = Field(default=None, primary_key=True, index=True)
    gmail: Annotated[str, Field(default=None)]
    username: Annotated[str, Field(default=None, index=True)]
    logout_at: Annotated[datetime, Field(default_factory=lambda: datetime.now(timezone.utc))]
    is_active: Annotated[bool, Field(default=True)]
    role: Annotated[str, Field(default="user")]
    
    # Foreign Key → Link to UserSignIn
    register_id: int = Field(default=None, foreign_key="user_signin.id")
    user: Optional[UserSignIn] = Relationship(back_populates="logouts") # 👈 កែត្រង់នេះឱ្យត្រូវគ្នា
    
class UserFaceBook(SQLModel, table=True):
    __tablename__ = "user_facebook"

    id: Optional[int] = Field(default=None, primary_key=True,index = True)
    gmail: Annotated[str, Field(default =None)]
    username: Annotated[str,Field(default=None,index = True)]
    password: Annotated[str,Field(default = "PasswordGithub")]
    login_at: Annotated[datetime, Field(default_factory=datetime.now(timezone.utc))]
    is_active: Annotated[bool ,Field(default=True)]
    role: Annotated[str,Field(default="user")]


class UserGoogle(SQLModel, table=True):
    __tablename__ = "user_google"

    id: Optional[int] = Field(default=None, primary_key=True,index = True)
    gmail: Annotated[str, Field(default =None)]
    username: Annotated[str,Field(default=None,index = True)]
    password: Annotated[str,Field(default = "PasswordGithub")]
    login_at: Annotated[datetime, Field(default_factory=datetime.now(timezone.utc))]
    is_active: Annotated[bool ,Field(default=True)]
    role: Annotated[str,Field(default="user")]

class UserGithub(SQLModel, table=True):
    __tablename__ = "user_github"

    id: Optional[int] = Field(default=None, primary_key=True,index = True)
    gmail: Annotated[str, Field(default =None)]
    username: Annotated[str,Field(default=None,index = True)]
    password: Annotated[str,Field(default = "PasswordGithub")]
    login_at: Annotated[datetime, Field(default_factory=datetime.now(timezone.utc))]
    is_active: Annotated[bool ,Field(default=True)]
    role: Annotated[str,Field(default="user")]
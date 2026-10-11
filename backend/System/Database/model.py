
from datetime import datetime, timezone
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship
from typing import Annotated



class FacebookSignIn(SQLModel,table=True):
    __tablename__ = "facebook_sign_in"
    
    id: Optional[int] = Field(default=None, primary_key=True,index = True)
    gmail: Annotated[str, Field(default =None)]
    username: Annotated[str,Field(default=None,index = True)]
    password: Annotated[str,Field(default = "PasswordGithub")]
    create_at: Annotated[datetime, Field(default_factory=datetime.now(timezone.utc))]
    is_active: Annotated[bool ,Field(default=True)]
    role: Annotated[str,Field(default="user")]
    
    user_facebook_login: list["UserFacebookLogin"] = Relationship(back_populates="user")
class UserFacebookLogin(SQLModel, table=True):
    __tablename__ = "user_facebook_login"

    id: Optional[int] = Field(default=None, primary_key=True,index = True)
    gmail: Annotated[str, Field(default =None)]
    username: Annotated[str,Field(default=None,index = True)]
    password: Annotated[str,Field(default = "Password")]
    login_at: Annotated[datetime, Field(default_factory=datetime.now(timezone.utc))]
    is_active: Annotated[bool ,Field(default=True)]
    role: Annotated[str,Field(default="user")]
    
    facebook_id: int = Field(default=None, foreign_key="facebook_sign_in.id")
    user: Optional[FacebookSignIn] = Relationship(back_populates="user_facebook_login")  
    user_facebook_logouts: list["UserLogout"] = Relationship(back_populates="facebook_signin")

class GithubSignIn(SQLModel,table=True):
    __tablename__= "github_sign_in"
    
    id: Optional[int] = Field(default=None, primary_key=True,index = True)
    gmail: Annotated[str, Field(default =None)]
    username: Annotated[str,Field(default=None,index = True)]
    password: Annotated[str,Field(default = "PasswordGithub")]
    create_at: Annotated[datetime, Field(default_factory=datetime.now(timezone.utc))]
    is_active: Annotated[bool ,Field(default=True)]
    role: Annotated[str,Field(default="user")]
    
    user_github_login:list["UserGithubLogin"] = Relationship(back_populates="user")

    
class UserGithubLogin(SQLModel, table=True):
    __tablename__ = "user_github_login"

    id: Optional[int] = Field(default=None, primary_key=True,index = True)
    gmail: Annotated[str, Field(default =None)]
    username: Annotated[str,Field(default=None,index = True)]
    password: Annotated[str,Field(default = "PasswordGithub")]
    login_at: Annotated[datetime, Field(default_factory=datetime.now(timezone.utc))]
    is_active: Annotated[bool ,Field(default=True)]
    role: Annotated[str,Field(default="user")]
    
    
    github_id: int = Field(default=None, foreign_key="github_sign_in.id")
    user: Optional[GithubSignIn] = Relationship(back_populates="user_github_login")  
    user_github_logouts: list["UserLogout"] = Relationship(back_populates="github_signin")

class GoogleSignIn(SQLModel, table=True):
    __tablename__ = "google_sign_in"
    
    id: Optional[int] = Field(default=None, primary_key=True, index=True)
    gmail: Annotated[str, Field(default=None)]
    username: Annotated[str, Field(default=None, index=True)]
    password: Annotated[str, Field(default="PasswordGithub")]
    create_at: Annotated[datetime, Field(default_factory=lambda: datetime.now(timezone.utc))]
    is_active: Annotated[bool, Field(default=True)]
    role: Annotated[str, Field(default="user")]
    
    user_google_login: list["UserGoogleLogin"] = Relationship(back_populates="user")
    
   
    
    
class UserGoogleLogin(SQLModel, table=True):
    __tablename__ = "user_google_login"

    id: Optional[int] = Field(default=None, primary_key=True, index=True)
    gmail: Annotated[str, Field(default=None)]
    username: Annotated[str, Field(default=None, index=True)]
    password: Annotated[str, Field(default="PasswordGoogle")]
    login_at: Annotated[datetime, Field(default_factory=datetime.now(timezone.utc))]
    is_active: Annotated[bool, Field(default=True)]
    role: Annotated[str, Field(default="user")]
    
    google_id: int = Field(default=None, foreign_key="google_sign_in.id")
    user: Optional[GoogleSignIn] = Relationship(back_populates="user_google_login")
    user_google_logouts: list["UserLogout"] = Relationship(back_populates="google_signin")


# ១. ថ្នាក់ UserLogin
class UserLogin(SQLModel, table=True):
    __tablename__ = "user_login"

    id: Optional[int] = Field(default=None, primary_key=True, index=True)
    gmail: str = Field(default=None)
    username: Optional[str] = Field(default=None, index=True)
    login_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = Field(default=True)
    role: str = Field(default="user")

    register_id: int = Field(default=None, foreign_key="user_signin.id")
    
    user: Optional["UserSignIn"] = Relationship(back_populates="logins")  
    # 👇 កែ back_populates ឱ្យត្រូវទៅនឹងឈ្មោះ user_login នៅខាង UserLogout
    logouts: List["UserLogout"] = Relationship(back_populates="user_login")


# ២. ថ្នាក់ UserLogout
class UserLogout(SQLModel, table=True):
    __tablename__ = "user_logout"
    
    id: Optional[int] = Field(default=None, primary_key=True, index=True)
    gmail: str = Field(default=None)
    username: Optional[str] = Field(default=None, index=True)
    logout_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = Field(default=True)
    role: str = Field(default="user")
    
    register_id: int = Field(default=None, foreign_key="user_login.id")
    # ឈ្មោះ attribute នេះគឺ user_login ដូច្នេះ back_populates នៅខាង UserLogin ត្រូវតែជា user_login ដែរ
    user_login: Optional["UserLogin"] = Relationship(back_populates="logouts") 
    
    facebook_id: Optional[int] = Field(default=None, foreign_key="user_facebook_login.id")
    github_id: Optional[int] = Field(default=None, foreign_key="user_github_login.id")
    google_id: Optional[int] = Field(default=None, foreign_key="user_google_login.id")
    
    user_id: Optional[int] = Field(default=None, foreign_key="user_signin.id")
    user_signin: Optional["UserSignIn"] = Relationship(back_populates="user_logouts")
    
    google_signin: Optional["UserGoogleLogin"] = Relationship(back_populates="user_google_logouts")
    github_signin: Optional["UserGithubLogin"] = Relationship(back_populates="user_github_logouts")
    facebook_signin: Optional["UserFacebookLogin"] = Relationship(back_populates="user_facebook_logouts")

# ៣. ដាក់ UserSignIn នៅខាងក្រោមគេបង្អស់
class UserSignIn(SQLModel, table=True):
    __tablename__ = "user_signin"

    id: Optional[int] = Field(default=None, primary_key=True, index=True)
    gmail: str = Field(default=None, unique=True)
    username: Optional[str] = Field(default=None, index=True)
    password: str
    create_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    is_active: bool = Field(default=True)
    role: str = Field(default="user")

    logins: List["UserLogin"] = Relationship(back_populates="user")
    # 👇 ដាក់ឈ្មោះ field នេះឱ្យត្រូវជាមួយ back_populates នៅខាង UserLogout
    user_logouts: List["UserLogout"] = Relationship(back_populates="user_signin")
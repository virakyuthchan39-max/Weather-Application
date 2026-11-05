
from datetime import datetime, timezone
from typing import Optional, List
from sqlmodel import SQLModel,MetaData, Field, Relationship
from typing import Annotated


class FacebookSignIn(SQLModel, table=True, ):
    __tablename__ = "facebook_sign_in"
    
    id: Optional[int] = Field(default=None, primary_key=True, index=True)

    gmail: Annotated[Optional[str], Field(default=None, unique=True)] 
    username: Annotated[Optional[str], Field(default=None, index=True)]
    password: Annotated[str, Field(default="FacebookPassword")]
    create_at: Annotated[str, Field(default_factory=lambda: str(datetime.now(timezone.utc).strftime("%Y %m %d (%I:%M %p)")))]
    is_active: Annotated[bool, Field(default=True)]
    role: Annotated[str, Field(default="user")]
    account_type: Annotated[str, Field(default="Facebook")]
    profile: Annotated[str,Field(default=None)]   
    user_facebook_login: list["UserFacebookLogin"] = Relationship(back_populates="user")

# ✅ កែ UserFacebookLogin (បន្ថែម Metadata និង Optional)
class UserFacebookLogin(SQLModel, table=True, ):
    __tablename__ = "user_facebook_login"

    id: Optional[int] = Field(default=None, primary_key=True, index=True)
    gmail: Annotated[Optional[str], Field(default=None)]
    username: Annotated[Optional[str], Field(default=None, index=True)]
    password: Annotated[str, Field(default="FacebookPassword")]

    login_at: Annotated[str, Field(default_factory=lambda: str(datetime.now(timezone.utc).strftime("%Y %m %d (%I:%M %p)")))]
    is_active: Annotated[bool, Field(default=True)]
    role: Annotated[str, Field(default="user")]
    account_type: Annotated[str, Field(default="Facebook")]
    
    profile: Annotated[str,Field(default=None)]
    facebook_id: Annotated[Optional[int], Field(default=None, foreign_key="facebook_sign_in.id")]
    user: Optional[FacebookSignIn] = Relationship(back_populates="user_facebook_login")  
    user_facebook_logouts: list["UserLogout"] = Relationship(back_populates="facebook_login")
class GithubSignIn(SQLModel,table=True,):
    __tablename__= "github_sign_in"
    
    id: Optional[int] = Field(default=None, primary_key=True,index = True)
    gmail: Annotated[str, Field(default =None,unique=True)]
    username: Annotated[str,Field(default=None,index = True)]
    password: Annotated[str,Field(default = "GithubPassword")]
    profile: Annotated[str,Field(default=None)]
    create_at: Annotated[str, Field(default_factory=lambda: str(datetime.now(timezone.utc).strftime("%Y %m %d (%I:%M %p)")))]
    is_active: Annotated[bool ,Field(default=True)]
    role: Annotated[str,Field(default="user")]
    account_type: Annotated[str,Field(default= "Github")]
    user_github_login:list["UserGithubLogin"] = Relationship(back_populates="user")

    
class UserGithubLogin(SQLModel, table=True,):
    __tablename__ = "user_github_login"

    id: Optional[int] = Field(default=None, primary_key=True,index = True)
    gmail: Annotated[str, Field(default =None,unique=True)]
    username: Annotated[str,Field(default=None,index = True)]
    password: Annotated[str,Field(default = "GithubPassword")]
    profile: Annotated[str,Field(default=None)]
    login_at: Annotated[str, Field(default_factory=lambda: str(datetime.now(timezone.utc).strftime("%Y %m %d (%I:%M %p)")))]
    is_active: Annotated[bool ,Field(default=True)]
    role: Annotated[str,Field(default="user")]
    account_type: Annotated[str,Field(default= "Github")]
    
    github_id: Annotated[Optional[int], Field(default=None, foreign_key="github_sign_in.id")]
    user: Optional[GithubSignIn] = Relationship(back_populates="user_github_login")  
    user_github_logouts: list["UserLogout"] = Relationship(back_populates="github_login")

class GoogleSignIn(SQLModel, table=True,):
    __tablename__ = "google_sign_in"
    
    id: Optional[int] = Field(default=None, primary_key=True, index=True)
    gmail: Annotated[str, Field(default=None)]
    username: Annotated[str, Field(default=None, index=True)]
    profile: Annotated[str,Field(default=None)]
    password: Annotated[str, Field(default="GooglePassword")]
    create_at: Annotated[str, Field(default_factory=lambda: str(datetime.now(timezone.utc).strftime("%Y %m %d (%I:%M %p)")))]
    is_active: Annotated[bool, Field(default=True)]
    role: Annotated[str, Field(default="user")]
    account_type: Annotated[str,Field(default= "Google")]
    user_google_login: list["UserGoogleLogin"] = Relationship(back_populates="user")
    
   
    
    
class UserGoogleLogin(SQLModel, table=True,):
    __tablename__ = "user_google_login"

    id: Optional[int] = Field(default=None, primary_key=True, index=True)
    gmail: Annotated[str, Field(default=None,unique=True)]
    username: Annotated[str, Field(default=None, index=True)]
    password: Annotated[str, Field(default="GooglePassword",max_length=72)]
    login_at: Annotated[str, Field(default_factory=lambda: str(datetime.now(timezone.utc)).strftime("%Y %m %d (%I:%M %p)"))]
    is_active: Annotated[bool, Field(default=True)]
    profile: Annotated[str,Field(default=None)]
    role: Annotated[str, Field(default="user")]
    account_type: Annotated[str,Field(default= "Google")]
    
    profile: Annotated[str,Field(default=None)] 
    google_id: Annotated[Optional[int], Field(default=None, foreign_key="google_sign_in.id")]
    user: Optional[GoogleSignIn] = Relationship(back_populates="user_google_login")
    user_google_logouts: list["UserLogout"] = Relationship(back_populates="google_login")


# ១. ថ្នាក់ UserLogin
class UserLogin(SQLModel, table=True,):
    __tablename__ = "user_login"

    id: Optional[int] = Field(default=None, primary_key=True, index=True)
    gmail: str = Field(default=None,unique=True)
    username: Optional[str] = Field(default=None, index=True)
    login_at: str = Field(default_factory=lambda: str(datetime.now(timezone.utc).strftime("%Y %m %d (%I:%M %p)")))
    is_active: bool = Field(default=True)
    role: str = Field(default="user")
    account_type: Annotated[str,Field(default= "Regular")]
    register_id: Annotated[Optional[int],  Field(default=None, foreign_key="user_signin.id")]
    profile: Annotated[str,Field(default="")]
    user: Optional["UserSignIn"] = Relationship(back_populates="logins")  
    logouts: List["UserLogout"] = Relationship(back_populates="user_login")


# ២. ថ្នាក់ UserLogout
class UserLogout(SQLModel, table=True, ):
    __tablename__ = "user_logout"
    
    id: Optional[int] = Field(default=None, primary_key=True, index=True)
    gmail: Annotated[Optional[str], Field(default=None)]
    username: Annotated[Optional[str], Field(default=None, index=True)]
    logout_at: str = Field(default_factory=lambda: str(datetime.now(timezone.utc).strftime("%Y %m %d (%I:%M %p)")))
    is_active: bool = Field(default=True)
    role: str = Field(default="user")
    
   
    login_id: Annotated[Optional[int], Field(default=None, foreign_key="user_login.id")]
    user_login: Optional["UserLogin"] = Relationship(back_populates="logouts") 
    
    facebook_login_id: Annotated[Optional[int], Field(default=None, foreign_key="user_facebook_login.id")]
    github_login_id: Annotated[Optional[int], Field(default=None, foreign_key="user_github_login.id")]
    google_login_id: Annotated[Optional[int], Field(default=None, foreign_key="user_google_login.id")]
    
    facebook_signin_id: Annotated[Optional[int], Field(default=None, foreign_key="facebook_sign_in.id")]
    github_signin_id: Annotated[Optional[int], Field(default=None, foreign_key="github_sign_in.id")]
    google_signin_id: Annotated[Optional[int], Field(default=None, foreign_key="google_sign_in.id")]
    
    signin_id: Annotated[Optional[int], Field(default=None, foreign_key="user_signin.id")]
    user_signin: Optional["UserSignIn"] = Relationship(back_populates="user_logouts")
    
    google_login: Optional["UserGoogleLogin"] = Relationship(back_populates="user_google_logouts")
    github_login: Optional["UserGithubLogin"] = Relationship(back_populates="user_github_logouts")
    facebook_login: Optional["UserFacebookLogin"] = Relationship(back_populates="user_facebook_logouts")

# ✅ កែ UserSignIn
class UserSignIn(SQLModel, table=True, ):
    __tablename__ = "user_signin"

    id: Optional[int] = Field(default=None, primary_key=True, index=True)
    gmail: str = Field(unique=True) # មិនត្រូវការ default=None ទេ ព្រោះវាជា Required Field
    username: Optional[str] = Field(default=None, index=True)
    password: str
    create_at: str = Field(default_factory=lambda: str(datetime.now(timezone.utc).strftime("%Y %m %d (%I:%M %p)")))
    is_active: bool = Field(default=True)
    role: str = Field(default="user")
    profile: Annotated[str,Field(default="")]
    account_type: Annotated[str, Field(default="Regular")]
    logins: List["UserLogin"] = Relationship(back_populates="user")
  
    user_logouts: List["UserLogout"] = Relationship(back_populates="user_signin")
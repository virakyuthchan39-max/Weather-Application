from datetime import datetime, timezone
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship
from typing import Annotated


class Admin(SQLModel, table=True, ):
    __tablename__ = "admin"
    
    id: Optional[int] = Field(default=None, primary_key=True, index=True)
    gmail: Annotated[str, Field(default=None, unique=True)]
    username: Annotated[str, Field(default=None, index=True)]
    password: Annotated[str, Field(default="FacebookPassword")]
    create_at: Annotated[datetime, Field(default_factory=lambda: datetime.now(timezone.utc))]
    is_active: Annotated[bool, Field(default=True)]
    role: Annotated[str, Field(default="admin")]
    account_type: Annotated[str, Field(default=None)]
    add_by: Annotated[str, Field(default=None)]
    
    # Relationships
    actions: List["AdminAction"] = Relationship(back_populates="admin_info")
    status_logs: List["UserStatusLog"] = Relationship(back_populates="admin_info")


class AdminAction(SQLModel, table=True, ):
    __tablename__ = "admin_action"
    
    id: Optional[int] = Field(default=None, primary_key=True, index=True)
    admin_id: Optional[int] = Field(default=None, foreign_key="admin.id")
    gmail: Annotated[str, Field(default=None)]
    account_type: Annotated[str, Field(default=None)]
    action: Annotated[str, Field(default=None)] 
    did_at: Annotated[datetime, Field(default_factory=lambda: datetime.now(timezone.utc))]
    details: Annotated[Optional[str], Field(default=None)]
    
    admin_info: Optional[Admin] = Relationship(back_populates="actions")


class SuperAdmin(SQLModel, table=True, ):
    __tablename__ = "supervisor_admin" # កែអក្ខរាវិរុទ្ធឱ្យត្រូវ

    id: Optional[int] = Field(default=None, primary_key=True, index=True)
    gmail: Annotated[str, Field(default=None)]
    username: Annotated[str, Field(default=None, index=True)]
    create_at: Annotated[datetime, Field(default_factory=lambda: datetime.now(timezone.utc))]
    is_active: Annotated[bool, Field(default=True)]
    role: Annotated[str, Field(default="supervisor_admin")]
    add_by: Annotated[str, Field(default=None)]
    account_type: Annotated[str, Field(default=None)]
    
    # 🔗 ត្រូវចង្អុលទៅ SuperAdminAction មិនមែនខ្លួនឯងទេ
    sup_admin_actions: List["SuperAdminAction"] = Relationship(back_populates="sup_admin_info")
    status_logs: List["UserStatusLog"] = Relationship(back_populates="super_admin_info")


class SuperAdminAction(SQLModel, table=True, ):
    __tablename__ = "supervisor_admin_action"
    
    id: Optional[int] = Field(default=None, primary_key=True, index=True)
    super_admin_id: Optional[int] = Field(default=None, foreign_key="supervisor_admin.id") # 🔗 ត្រូវចងទៅ supervisor_admin
    gmail: Annotated[str, Field(default=None)]
    account_type: Annotated[str, Field(default=None)]
    action: Annotated[str, Field(default=None)] # ឧ. "ADD_ADMIN", "REMOVE_ADMIN"
    did_at: Annotated[datetime, Field(default_factory=lambda: datetime.now(timezone.utc))]
    details: Annotated[Optional[str], Field(default=None)]
    
    sup_admin_info: Optional[SuperAdmin] = Relationship(back_populates="sup_admin_actions")
    

class UserStatusLog(SQLModel, table=True, ):
    __tablename__ = "user_status_log"

    id: Optional[int] = Field(default=None, primary_key=True, index=True)
    
    # កំណត់ថាអ្នកណាជាអ្នកធ្វើការ Ban/Suspend (អាចជា Admin ឬ SuperAdmin)
    admin_id: Optional[int] = Field(default=None, foreign_key="admin.id") 
    super_admin_id: Optional[int] = Field(default=None, foreign_key="supervisor_admin.id")
    
    gmail: Annotated[str, Field(default=None, index=True)]  
    username: Annotated[str, Field(default=None)]  
    account_type: Annotated[str, Field(default=None)]
    
    penalty_type: Annotated[str, Field(default="SUSPENDED", index=True)] # "BANNED", "SUSPENDED", "WARNED"
    reason: Annotated[str, Field(default="Violation of terms")]    
    created_at: Annotated[datetime, Field(default_factory=lambda: datetime.now(timezone.utc))]
    is_active: Annotated[bool, Field(default=True)] 
    
    # Relationships
    admin_info: Optional[Admin] = Relationship(back_populates="status_logs")
    super_admin_info: Optional[SuperAdmin] = Relationship(back_populates="status_logs")
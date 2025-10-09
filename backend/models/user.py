from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum
import uuid

class UserRole(str, Enum):
    CUSTOMER = "customer"
    TECHNICIAN = "technician"
    ADMIN = "admin"

class Address(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    street: str
    city: str
    state: str
    zip_code: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    is_default: bool = False

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    phone: str
    first_name: str
    last_name: str
    role: UserRole
    addresses: List[Address] = []
    is_active: bool = True
    marketing_opt_in: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Customer specific fields
    customer_notes: Optional[str] = None
    tags: List[str] = []  # VIP, repeat, warranty, etc.
    
    # Technician specific fields
    hourly_rate: Optional[float] = None
    skills: List[str] = []  # drywall, painting, electrical, etc.
    available_hours: Optional[dict] = None  # weekly schedule
    
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    phone: str
    first_name: str
    last_name: str
    role: UserRole = UserRole.CUSTOMER
    marketing_opt_in: bool = False

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    
class TokenData(BaseModel):
    email: Optional[str] = None
    user_id: Optional[str] = None
    role: Optional[UserRole] = None
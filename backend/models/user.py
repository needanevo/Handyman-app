from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum
import uuid

class UserRole(str, Enum):
    CUSTOMER = "customer"
    HANDYMAN = "handyman"  # Unlicensed, starting business
    TECHNICIAN = "technician"  # Licensed contractor
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
    
    # Technician/Handyman specific fields (shared by both)
    business_name: Optional[str] = None  # Business/company name
    hourly_rate: Optional[float] = None
    skills: List[str] = []  # drywall, painting, electrical, etc.
    available_hours: Optional[dict] = None  # weekly schedule
    years_experience: Optional[int] = None  # Years of experience
    service_areas: List[str] = []  # Cities or zip codes they serve
    documents: Optional[dict] = None  # license, insurance, etc.
    portfolio_photos: List[str] = []  # Portfolio photo URLs
    profile_photo: Optional[str] = None  # Profile picture/logo URL

    # Business growth tracking
    has_llc: bool = False  # Whether they've formed an LLC
    llc_formation_date: Optional[datetime] = None
    is_licensed: bool = False  # Whether they have trade license
    license_number: Optional[str] = None
    license_state: Optional[str] = None
    license_expiry: Optional[datetime] = None
    is_insured: bool = False  # Whether they have liability insurance
    insurance_policy_number: Optional[str] = None
    insurance_expiry: Optional[datetime] = None

    # Growth milestone tracking
    upgrade_to_technician_date: Optional[datetime] = None  # When handyman became licensed
    registration_completed_date: Optional[datetime] = None
    registration_status: Optional[str] = "ACTIVE"  # ACTIVE, PENDING, SUSPENDED
    
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    phone: str
    firstName: str
    lastName: str
    role: UserRole = UserRole.CUSTOMER
    marketingOptIn: bool = False
    businessName: Optional[str] = None  # For contractors

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
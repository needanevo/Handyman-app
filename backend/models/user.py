from pydantic import BaseModel, Field, EmailStr, field_validator
from typing import Optional, List
from datetime import datetime
from enum import Enum
import uuid

class UserRole(str, Enum):
    CUSTOMER = "customer"
    HANDYMAN = "handyman"  # Unlicensed, starting business
    CONTRACTOR = "contractor"  # Licensed contractor (formerly "technician")
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

class LocationVerification(BaseModel):
    """Customer location verification status"""
    status: str = "unverified"  # "unverified" | "verified" | "mismatch"
    device_lat: Optional[float] = None
    device_lon: Optional[float] = None
    verified_at: Optional[datetime] = None
    auto_verify_enabled: bool = True

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
    verification: Optional[LocationVerification] = None  # Customer location verification
    
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

    # Address verification tracking (for contractors/handymen)
    address_verification_status: Optional[str] = "pending"  # "pending" | "verified" | "failed"
    address_verification_started_at: Optional[datetime] = None
    address_verification_deadline: Optional[datetime] = None

    # Provider identity & status (Phase 5B)
    provider_type: Optional[str] = "individual"  # "individual" | "business"
    provider_intent: Optional[str] = "not_hiring"  # "not_hiring" | "hiring" | "mentoring"
    provider_status: Optional[str] = "draft"  # "draft" | "submitted" | "active" | "restricted"
    provider_completeness: Optional[int] = 0  # Percentage 0-100
    specialties: List[str] = []  # Contractor-only specialties (e.g., commercial, residential, remodeling)
    license_info: Optional[dict] = None  # Structured license data placeholder
    insurance_info: Optional[dict] = None  # Structured insurance data placeholder
    
class AddressInput(BaseModel):
    """Address input for registration"""
    street: str
    city: str
    state: str
    zipCode: str
    unitNumber: Optional[str] = None

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    phone: str
    firstName: str
    lastName: str
    role: UserRole = UserRole.CUSTOMER
    marketingOptIn: bool = False
    businessName: Optional[str] = None  # For contractors
    address: Optional[AddressInput] = None  # For customer registration

    @field_validator('role', mode='before')
    @classmethod
    def normalize_role(cls, v):
        """Normalize legacy 'technician' to 'contractor' for backward compatibility"""
        if isinstance(v, str) and v.lower() == "technician":
            return "contractor"
        return v

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
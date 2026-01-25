# backend/models/address.py

from datetime import datetime
from typing import Optional
from uuid import uuid4

from pydantic import BaseModel, Field


class AddressInput(BaseModel):
    """
    Address input model for API requests (without user_id).
    Used when user is authenticated and user_id comes from token.
    Supports Google Places Autocomplete fields.
    """
    street: str
    line2: Optional[str] = None  # apt/suite/unit (Google Places compatible)
    unit_number: Optional[str] = None  # legacy field, maps to line2
    city: str
    state: str
    zip_code: str
    country: str = "US"
    is_default: bool = False
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    place_id: Optional[str] = None  # Google Places place_id
    formatted_address: Optional[str] = None  # Full formatted address from Google


class Address(BaseModel):
    """
    Canonical Address model for addresses collection.
    Separate from embedded User.addresses for single source of truth.
    Supports Google Places Autocomplete fields.
    """
    id: str = Field(default_factory=lambda: str(uuid4()))
    user_id: str
    street: str
    line2: Optional[str] = None  # apt/suite/unit
    city: str
    state: str
    zip_code: str
    country: str = "US"
    is_default: bool = False
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    place_id: Optional[str] = None  # Google Places place_id
    formatted_address: Optional[str] = None  # Full formatted address
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        orm_mode = True

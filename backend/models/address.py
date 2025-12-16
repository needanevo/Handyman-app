# backend/models/address.py

from datetime import datetime
from typing import Optional
from uuid import uuid4

from pydantic import BaseModel, Field


class AddressInput(BaseModel):
    """
    Address input model for API requests (without user_id).
    Used when user is authenticated and user_id comes from token.
    """
    street: str
    unit_number: Optional[str] = None
    city: str
    state: str
    zip_code: str
    is_default: bool = False
    latitude: Optional[float] = None
    longitude: Optional[float] = None


class Address(BaseModel):
    """
    Canonical Address model for addresses collection.
    Separate from embedded User.addresses for single source of truth.
    """
    id: str = Field(default_factory=lambda: str(uuid4()))
    user_id: str
    street: str
    unit_number: Optional[str] = None
    city: str
    state: str
    zip_code: str
    is_default: bool = False
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        orm_mode = True

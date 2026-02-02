"""
Mileage tracking models for contractors
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class MileageLocation(BaseModel):
    address: str
    latitude: float
    longitude: float


class MileageLog(BaseModel):
    id: str
    contractor_id: str
    job_id: Optional[str] = None
    date: str  # ISO date string
    start_location: MileageLocation
    end_location: MileageLocation
    miles: float
    purpose: str
    notes: Optional[str] = None
    auto_tracked: bool = False
    created_at: datetime
    updated_at: datetime


class MileageCreateRequest(BaseModel):
    job_id: Optional[str] = None
    date: str
    start_location: MileageLocation
    end_location: MileageLocation
    miles: float
    purpose: str
    notes: Optional[str] = None
    auto_tracked: bool = False

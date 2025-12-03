"""
Change order system models for job scope changes
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum


class ChangeOrderStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class ChangeOrder(BaseModel):
    id: str
    job_id: str
    contractor_id: str
    customer_id: str
    description: str
    reason: str  # Why the change is needed
    additional_cost: float  # Additional cost (can be negative for credits)
    additional_hours: Optional[float] = None
    photo_urls: list[str] = []
    status: ChangeOrderStatus
    requested_at: datetime
    decided_at: Optional[datetime] = None
    decision_notes: Optional[str] = None
    decided_by: Optional[str] = None  # user_id of approver/rejecter
    created_at: datetime
    updated_at: datetime


class ChangeOrderCreate(BaseModel):
    description: str
    reason: str
    additional_cost: float
    additional_hours: Optional[float] = None
    photo_urls: list[str] = []


class ChangeOrderDecision(BaseModel):
    decision_notes: Optional[str] = None

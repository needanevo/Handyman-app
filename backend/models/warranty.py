"""
Warranty system models for job warranty requests
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum


class WarrantyStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    DENIED = "denied"


class WarrantyRequest(BaseModel):
    id: str
    job_id: str
    customer_id: str
    contractor_id: str
    issue_description: str
    photo_urls: list[str] = []
    status: WarrantyStatus
    requested_at: datetime
    decided_at: Optional[datetime] = None
    decision_notes: Optional[str] = None
    decided_by: Optional[str] = None  # user_id of approver/denier
    created_at: datetime
    updated_at: datetime


class WarrantyRequestCreate(BaseModel):
    issue_description: str
    photo_urls: list[str] = []


class WarrantyDecision(BaseModel):
    decision_notes: Optional[str] = None

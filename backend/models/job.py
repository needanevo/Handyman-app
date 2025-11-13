"""
Job model for managing handyman service jobs.

Jobs are created when a customer accepts a quote and represent
the actual work to be performed by a contractor.
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date
from enum import Enum
import uuid


class JobStatus(str, Enum):
    """Job status workflow"""
    PENDING = "pending"  # Quote accepted, waiting for contractor assignment
    SCHEDULED = "scheduled"  # Contractor assigned, date scheduled
    IN_PROGRESS = "in_progress"  # Work started
    COMPLETED = "completed"  # Work finished
    CANCELLED = "cancelled"  # Job cancelled


class Job(BaseModel):
    """Job represents actual work to be performed"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))

    # References
    customer_id: str
    contractor_id: Optional[str] = None  # Assigned contractor
    quote_id: str  # Original quote

    # Job details
    status: JobStatus = JobStatus.PENDING
    service_category: str
    description: str

    # Scheduling
    scheduled_date: Optional[datetime] = None
    estimated_duration_hours: Optional[float] = None
    completed_date: Optional[datetime] = None

    # Location
    address_id: str

    # Financial
    agreed_amount: float
    deposit_amount: Optional[float] = None
    deposit_paid: bool = False
    final_amount: Optional[float] = None  # May differ from agreed after work
    paid_in_full: bool = False

    # Metadata
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Notes and tracking
    customer_notes: Optional[str] = None
    contractor_notes: Optional[str] = None
    cancellation_reason: Optional[str] = None

    # Photos (work progress/completion)
    before_photos: List[str] = []
    after_photos: List[str] = []


class JobCreate(BaseModel):
    """Request to create a job from accepted quote"""
    quote_id: str
    preferred_date: Optional[str] = None  # ISO date string
    customer_notes: Optional[str] = None


class JobUpdate(BaseModel):
    """Update job fields"""
    status: Optional[JobStatus] = None
    contractor_id: Optional[str] = None
    scheduled_date: Optional[datetime] = None
    estimated_duration_hours: Optional[float] = None
    completed_date: Optional[datetime] = None
    contractor_notes: Optional[str] = None
    before_photos: Optional[List[str]] = None
    after_photos: Optional[List[str]] = None
    final_amount: Optional[float] = None
    paid_in_full: Optional[bool] = None

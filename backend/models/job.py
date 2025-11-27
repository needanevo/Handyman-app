"""
Job model for Phase 4 architecture.

Jobs represent work requests from customers that can receive proposals from handymen/contractors.
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum
import uuid


class JobStatus(str, Enum):
    """Job lifecycle states"""
    DRAFT = "draft"
    PUBLISHED = "published"  # Visible in feed, accepting proposals
    PROPOSAL_SELECTED = "proposal_selected"  # Customer chose a proposal
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED_PENDING_REVIEW = "completed_pending_review"
    COMPLETED = "completed"
    CANCELLED_BY_CUSTOMER = "cancelled_by_customer"
    CANCELLED_BY_CONTRACTOR = "cancelled_by_contractor"


class ContractorTypePreference(str, Enum):
    """Customer's preference for contractor type"""
    HANDYMAN = "handyman"
    LICENSED = "licensed"
    NO_PREFERENCE = "no_preference"


class JobAddress(BaseModel):
    """Address embedded in job"""
    street: str
    city: str
    state: str
    zip: str
    lat: Optional[float] = None
    lon: Optional[float] = None


class Job(BaseModel):
    """Job represents a work request that can receive proposals"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))

    # References
    customer_id: str
    assigned_contractor_id: Optional[str] = None  # Set when proposal accepted

    # Status
    status: JobStatus = JobStatus.DRAFT

    # Job details
    service_category: str
    address: JobAddress
    description: str
    photos: List[str] = []  # Photo URLs from Linode
    budget_max: Optional[float] = None
    urgency: str = "low"  # low, medium, high
    preferred_timing: Optional[str] = None  # Free text or ISO window
    contractor_type_preference: Optional[ContractorTypePreference] = None

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Scheduling (set when status → scheduled)
    scheduled_start: Optional[datetime] = None
    scheduled_end: Optional[datetime] = None

    # Proposal linkage
    accepted_proposal_id: Optional[str] = None

    # Payout linkage
    payout_id: Optional[str] = None


class JobCreateRequest(BaseModel):
    """Request to create a new job"""
    service_category: str
    address: JobAddress
    description: str
    photos: List[str] = []
    budget_max: Optional[float] = None
    urgency: str = "low"
    preferred_timing: Optional[str] = None
    contractor_type_preference: Optional[ContractorTypePreference] = None
    status: JobStatus = JobStatus.DRAFT  # Can be DRAFT or PUBLISHED


class JobStatusUpdate(BaseModel):
    """Request to update job status"""
    status: JobStatus
    scheduled_start: Optional[datetime] = None
    scheduled_end: Optional[datetime] = None


class JobCreateResponse(BaseModel):
    """Response after creating a job"""
    job_id: str
    status: str
    estimated_total: float
    created_at: str

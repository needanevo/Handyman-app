"""
Proposal model for Phase 4 architecture.

Proposals are submitted by handymen/contractors in response to published jobs.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum
import uuid


class ProposalStatus(str, Enum):
    """Proposal lifecycle states"""
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"


class ContractorRole(str, Enum):
    """Type of contractor submitting proposal"""
    HANDYMAN = "handyman"
    CONTRACTOR = "contractor"


class Proposal(BaseModel):
    """Proposal submitted by contractor for a job"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))

    # References
    job_id: str
    contractor_id: str
    contractor_role: ContractorRole

    # Proposal details
    quoted_price: float
    estimated_duration: Optional[float] = None  # Hours
    proposed_start: Optional[datetime] = None
    message: Optional[str] = None

    # Status
    status: ProposalStatus = ProposalStatus.PENDING

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)


class ProposalCreateRequest(BaseModel):
    """Request to create a proposal"""
    quoted_price: float
    estimated_duration: Optional[float] = None
    proposed_start: Optional[datetime] = None
    message: Optional[str] = None


class ProposalResponse(BaseModel):
    """Response after creating/updating proposal"""
    id: str
    job_id: str
    contractor_id: str
    quoted_price: float
    status: ProposalStatus
    created_at: datetime

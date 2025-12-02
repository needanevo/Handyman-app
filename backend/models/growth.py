"""
Growth tracking models for Phase 4 architecture.

Tracks contractor growth milestones and progression.
"""

from pydantic import BaseModel, Field
from typing import Optional, Any
from datetime import datetime
from enum import Enum
import uuid


class GrowthEventType(str, Enum):
    """Types of growth events"""
    JOB_COMPLETED = "job_completed"
    REVENUE_EARNED = "revenue_earned"
    FIVE_STAR_REVIEW = "5_star_review"
    FOUR_STAR_REVIEW = "4_star_review"
    LLC_LINKED = "llc_linked"
    LICENSE_UPLOADED = "license_uploaded"
    INSURANCE_UPLOADED = "insurance_uploaded"


class ContractorGrowthRole(str, Enum):
    """Contractor type for growth tracking"""
    HANDYMAN = "handyman"
    CONTRACTOR = "contractor"


class LLCStatus(str, Enum):
    """LLC formation status"""
    NONE = "none"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"


class DocumentStatus(str, Enum):
    """Document verification status"""
    NONE = "none"
    UPLOADED = "uploaded"
    VERIFIED = "verified"


class GrowthEvent(BaseModel):
    """Individual growth milestone event"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))

    # References
    user_id: str
    role: ContractorGrowthRole

    # Event details
    type: GrowthEventType
    value: float  # Revenue amount, rating, or 1 for boolean events
    meta: Optional[dict] = None  # job_id, review_id, etc.

    # Timestamp
    created_at: datetime = Field(default_factory=datetime.utcnow)


class GrowthSummary(BaseModel):
    """Precomputed growth summary for fast dashboard queries"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))

    # References
    user_id: str
    role: ContractorGrowthRole

    # Job metrics
    total_jobs_completed: int = 0
    total_revenue: float = 0.0

    # Rating metrics
    average_rating: float = 0.0
    five_star_count: int = 0
    four_star_count: int = 0

    # Business growth status
    llc_status: LLCStatus = LLCStatus.NONE
    license_status: DocumentStatus = DocumentStatus.NONE
    insurance_status: DocumentStatus = DocumentStatus.NONE

    # Timestamp
    last_updated_at: datetime = Field(default_factory=datetime.utcnow)


class GrowthSummaryResponse(BaseModel):
    """Response for growth summary endpoint"""
    user_id: str
    total_jobs_completed: int
    total_revenue: float
    average_rating: float
    llc_status: LLCStatus
    license_status: DocumentStatus
    insurance_status: DocumentStatus
    last_updated_at: datetime

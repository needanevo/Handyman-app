"""
Payout model for Phase 4 architecture.

Payouts represent money owed to contractors for completed work.
Platform fee is 15% of gross amount.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum
import uuid


class PayoutStatus(str, Enum):
    """Payout lifecycle states"""
    PENDING = "pending"  # Created when job hits completed_pending_review
    QUEUED_FOR_TRANSFER = "queued_for_transfer"  # Ready to be sent to contractor
    PAID = "paid"  # Successfully transferred
    FAILED = "failed"  # Transfer failed


class PayoutProvider(str, Enum):
    """Payment provider"""
    STRIPE = "stripe"
    PLACEHOLDER = "placeholder"


class Payout(BaseModel):
    """Payout represents money owed to a contractor"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))

    # References
    job_id: str
    contractor_id: str

    # Amounts (15% platform fee)
    amount_gross: float  # Full job price
    platform_fee_amount: float  # 15% of gross
    amount_net: float  # What contractor receives (gross - fee)

    # Status
    status: PayoutStatus = PayoutStatus.PENDING

    # Provider details
    provider: PayoutProvider = PayoutProvider.PLACEHOLDER
    provider_payout_id: Optional[str] = None

    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    scheduled_payout_date: Optional[datetime] = None

    # Error tracking
    failure_reason: Optional[str] = None


class WalletSummary(BaseModel):
    """Wallet summary for contractor dashboard"""
    lifetime_earnings: float  # Sum of all paid + queued payouts
    available: float  # Queued for transfer
    pending: float  # Waiting for job completion
    last_payout_date: Optional[datetime] = None

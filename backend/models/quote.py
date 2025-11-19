from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from enum import Enum
import uuid

class QuoteStatus(str, Enum):
    DRAFT = "draft"
    SENT = "sent"
    VIEWED = "viewed"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    EXPIRED = "expired"

class QuoteItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    service_id: str
    service_title: str
    description: str
    quantity: float = 1.0
    unit_price: float
    total_price: float
    add_ons: List[dict] = []  # Selected add-ons with prices
    
class Quote(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    customer_id: str
    address_id: str
    
    # Quote details
    items: List[QuoteItem]
    subtotal: float
    tax_rate: float = 0.0
    tax_amount: float = 0.0
    trip_fee: float = 0.0
    discount_amount: float = 0.0
    total_amount: float
    
    # Customer request details
    description: str
    photos: List[str] = []  # Photo URLs (from Linode Object Storage)
    preferred_dates: List[date] = []
    budget_range: Optional[Dict[str, float]] = None  # {"min": 100, "max": 500}
    urgency: str = "normal"  # normal, urgent, flexible
    
    # Quote metadata
    status: QuoteStatus = QuoteStatus.DRAFT
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: Optional[datetime] = None
    sent_at: Optional[datetime] = None
    viewed_at: Optional[datetime] = None
    responded_at: Optional[datetime] = None
    
    # AI suggestions metadata
    ai_suggested: bool = False
    ai_confidence: Optional[float] = None
    ai_reasoning: Optional[str] = None
    manual_adjustments: Optional[str] = None
    
class QuoteRequest(BaseModel):
    service_category: str
    address_id: str
    description: str
    photos: List[str] = []  # Photo URLs (from Linode Object Storage)
    preferred_dates: List[str] = []  # ISO date strings
    budget_range: Optional[Dict[str, float]] = None
    urgency: str = "normal"
    
class QuoteResponse(BaseModel):
    accept: bool
    customer_notes: Optional[str] = None
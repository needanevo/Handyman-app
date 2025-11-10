from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum
import uuid

class ServiceCategory(str, Enum):
    DRYWALL = "drywall"
    PAINTING = "painting"
    ELECTRICAL = "electrical"
    PLUMBING = "plumbing"
    CARPENTRY = "carpentry"
    HVAC = "hvac"
    FLOORING = "flooring"
    ROOFING = "roofing"
    LANDSCAPING = "landscaping"
    APPLIANCE_REPAIR = "appliance_repair"
    WINDOW_DOOR_INSTALLATION = "window_door_installation"
    TILE_WORK = "tile_work"
    DECK_FENCE = "deck_fence"
    GUTTER_CLEANING = "gutter_cleaning"
    PRESSURE_WASHING = "pressure_washing"
    MISCELLANEOUS = "miscellaneous"

class PricingModel(str, Enum):
    FLAT = "flat"  # Fixed price
    HOURLY = "hourly"  # Per hour
    UNIT = "unit"  # Per square foot, per fixture, etc.

class AddOn(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    description: str
    price: float
    required: bool = False

class Service(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    category: ServiceCategory
    title: str
    description: str
    pricing_model: PricingModel
    base_price: float
    unit_label: Optional[str] = None  # "per sqft", "per fixture", etc.
    typical_duration: int  # in minutes
    add_ons: List[AddOn] = []
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Pricing rules for AI suggestions
    min_charge: Optional[float] = None
    max_charge: Optional[float] = None
    labor_multiplier: float = 1.0  # Base rate multiplier for complexity
    
class ServiceCreate(BaseModel):
    category: ServiceCategory
    title: str
    description: str
    pricing_model: PricingModel
    base_price: float
    unit_label: Optional[str] = None
    typical_duration: int
    add_ons: List[AddOn] = []
    min_charge: Optional[float] = None
    max_charge: Optional[float] = None
    labor_multiplier: float = 1.0
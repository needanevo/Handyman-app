from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from pydantic import BaseModel

class ProviderError(Exception):
    """Base exception for provider errors"""
    pass

class MockProviderMixin:
    """Mixin for providers that can operate in mock mode"""
    def __init__(self, mock_mode=False, **kwargs):
        self.mock_mode = mock_mode
        super().__init__(**kwargs)
        
    def _mock_log(self, operation: str, data: Dict[str, Any]):
        """Log mock operations for debugging"""
        print(f"[MOCK {self.__class__.__name__}] {operation}: {data}")

# Email Provider Interface
class EmailMessage(BaseModel):
    to: List[str]
    subject: str
    html_content: str
    text_content: Optional[str] = None
    from_email: Optional[str] = None
    
class EmailProvider(ABC):
    @abstractmethod
    async def send_email(self, message: EmailMessage) -> bool:
        pass
    
    @abstractmethod
    async def send_template_email(self, template_id: str, to: List[str], data: Dict[str, Any]) -> bool:
        pass

# SMS Provider Interface
class SmsMessage(BaseModel):
    to: str
    message: str
    from_number: Optional[str] = None
    
class SmsProvider(ABC):
    @abstractmethod
    async def send_sms(self, message: SmsMessage) -> bool:
        pass

# Payment Provider Interface
class PaymentIntent(BaseModel):
    id: str
    amount: int  # in cents
    currency: str = "usd"
    status: str
    client_secret: Optional[str] = None
    
class PaymentProvider(ABC):
    @abstractmethod
    async def create_payment_intent(self, amount: int, currency: str = "usd", metadata: Dict[str, Any] = None) -> PaymentIntent:
        pass
        
    @abstractmethod
    async def confirm_payment(self, payment_intent_id: str) -> PaymentIntent:
        pass
        
    @abstractmethod
    async def refund_payment(self, payment_intent_id: str, amount: Optional[int] = None) -> Dict[str, Any]:
        pass

# Maps Provider Interface
class GeocodeResult(BaseModel):
    latitude: float
    longitude: float
    formatted_address: str
    
class RouteResult(BaseModel):
    distance: str
    duration: str
    polyline: Optional[str] = None
    
class MapsProvider(ABC):
    @abstractmethod
    async def geocode(self, address: str) -> Optional[GeocodeResult]:
        pass
        
    @abstractmethod
    async def get_route(self, origin: str, destination: str) -> Optional[RouteResult]:
        pass

# AI Provider Interface
class AiQuoteSuggestion(BaseModel):
    estimated_hours: float
    suggested_materials: List[str]
    complexity_rating: int  # 1-5
    base_price_suggestion: float
    reasoning: str
    confidence: float  # 0-1
    
class AiProvider(ABC):
    @abstractmethod
    async def generate_quote_suggestion(self, service_type: str, description: str, photos_metadata: List[str] = None) -> AiQuoteSuggestion:
        pass
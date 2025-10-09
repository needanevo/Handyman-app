from fastapi import FastAPI, APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta, date
import uuid

# Import models
from models import (
    User, UserCreate, UserLogin, Token, UserRole, Address,
    Service, ServiceCreate, ServiceCategory, PricingModel,
    Quote, QuoteRequest, QuoteResponse, QuoteStatus, QuoteItem
)

# Import authentication
from auth.auth_handler import AuthHandler, get_current_user, require_admin, require_technician_or_admin

# Import services
# Import services
from services import PricingEngine

# Import providers
from providers import (
    EmergentAiProvider, MockEmailProvider, MockSmsProvider, 
    MockPaymentProvider, MockMapsProvider, MockAiProvider,
    ProviderError
)

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Initialize services and providers
auth_handler = AuthHandler(db)
pricing_engine = PricingEngine()

# Initialize providers based on feature flags
try:
    if os.getenv('FEATURE_AI_QUOTE_ENABLED', 'true').lower() == 'true':
        ai_provider = EmergentAiProvider()
    else:
        ai_provider = MockAiProvider()
except Exception as e:
    print(f"Warning: Failed to initialize AI provider, using mock: {e}")
    ai_provider = MockAiProvider()

email_provider = MockEmailProvider()
sms_provider = MockSmsProvider()
payment_provider = MockPaymentProvider()
maps_provider = MockMapsProvider()

# Create the main app
app = FastAPI(
    title="The Real Johnson Handyman Services API",
    description="Professional handyman booking and management system",
    version="1.0.0"
)

# Create API router
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# ==================== AUTHENTICATION ROUTES ====================

@api_router.post("/auth/register", response_model=Token)
async def register_user(user_data: UserCreate):
    """Register a new user"""
    try:
        # Check if user already exists
        existing_user = await auth_handler.get_user_by_email(user_data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists"
            )
        
        # Create new user - map camelCase to snake_case for User model
        user_dict = user_data.dict(exclude={"password"})
        user = User(
            email=user_dict["email"],
            phone=user_dict["phone"],
            first_name=user_dict["firstName"],
            last_name=user_dict["lastName"],
            role=user_dict["role"],
            marketing_opt_in=user_dict.get("marketingOptIn", False),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        # Save user to database
        await db.users.insert_one(user.dict())
        
        # Save password hash
        await auth_handler.create_user_password(user.id, user_data.password)
        
        # Create tokens
        access_token = auth_handler.create_access_token(
            data={"user_id": user.id, "email": user.email, "role": user.role}
        )
        refresh_token = auth_handler.create_refresh_token(
            data={"user_id": user.id, "email": user.email}
        )
        
        return Token(access_token=access_token, refresh_token=refresh_token)
        
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user"
        )

@api_router.post("/auth/login", response_model=Token)
async def login_user(login_data: UserLogin):
    """Login user and return tokens"""
    user = await auth_handler.authenticate_user(login_data.email, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    access_token = auth_handler.create_access_token(
        data={"user_id": user.id, "email": user.email, "role": user.role}
    )
    refresh_token = auth_handler.create_refresh_token(
        data={"user_id": user.id, "email": user.email}
    )
    
    return Token(access_token=access_token, refresh_token=refresh_token)

def get_current_user_dependency(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Dependency wrapper to inject auth_handler"""
    payload = auth_handler.verify_token(credentials.credentials)
    user_id = payload.get("user_id")
    
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )
    
    # Return a coroutine that can be awaited
    async def get_user():
        user = await auth_handler.get_user_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found"
            )
        
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Inactive user"
            )
        
        return user
    
    return get_user()

@api_router.get("/auth/me", response_model=User)
async def get_current_user_info(current_user: User = Depends(get_current_user_dependency)):
    """Get current user information"""
    return current_user

# ==================== SERVICE CATALOG ROUTES ====================

@api_router.get("/services", response_model=List[Service])
async def get_services(category: Optional[ServiceCategory] = None, active_only: bool = True):
    """Get all services, optionally filtered by category"""
    query = {}
    if category:
        query["category"] = category
    if active_only:
        query["is_active"] = True
    
    services = await db.services.find(query).to_list(1000)
    return [Service(**service) for service in services]

@api_router.get("/services/{service_id}", response_model=Service)
async def get_service(service_id: str):
    """Get a specific service by ID"""
    service = await db.services.find_one({"id": service_id})
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")
    return Service(**service)

@api_router.post("/services", response_model=Service)
async def create_service(
    service_data: ServiceCreate,
    current_user: User = Depends(require_admin)
):
    """Create a new service (admin only)"""
    service = Service(**service_data.dict())
    service.created_at = datetime.utcnow()
    service.updated_at = datetime.utcnow()
    
    await db.services.insert_one(service.dict())
    return service

# ==================== QUOTE ROUTES ====================

@api_router.post("/quotes/request")
async def request_quote(
    quote_request: QuoteRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Request a quote for services"""
    try:
        current_user = await get_current_user(credentials, auth_handler)
        # Get AI suggestion if enabled
        ai_suggestion = None
        if os.getenv('FEATURE_AI_QUOTE_ENABLED', 'true').lower() == 'true':
            try:
                ai_suggestion = await ai_provider.generate_quote_suggestion(
                    service_type=quote_request.service_category,
                    description=quote_request.description,
                    photos_metadata=[f"photo_{i}" for i in range(len(quote_request.photos))]
                )
            except Exception as e:
                logger.warning(f"AI quote generation failed: {e}")
        
        # Find relevant services
        services = await db.services.find({
            "category": quote_request.service_category.lower(),
            "is_active": True
        }).to_list(10)
        
        if not services:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"No services found for category: {quote_request.service_category}"
            )
        
        # Create quote items for matching services
        quote_items = []
        for service_data in services[:1]:  # Use first matching service for now
            service = Service(**service_data)
            quote_item = pricing_engine.create_quote_item(
                service=service,
                quantity=1.0,
                description=quote_request.description,
                ai_suggestion=ai_suggestion
            )
            quote_items.append(quote_item)
        
        # Calculate totals (mock distance for now)
        totals = pricing_engine.calculate_quote_totals(quote_items, distance_miles=5.0)
        
        # Create quote
        quote = Quote(
            customer_id=current_user.id,
            address_id=quote_request.address_id,
            items=quote_items,
            subtotal=totals["subtotal"],
            tax_rate=totals["tax_rate"],
            tax_amount=totals["tax_amount"],
            trip_fee=totals["trip_fee"],
            total_amount=totals["total_amount"],
            description=quote_request.description,
            photos=quote_request.photos,
            preferred_dates=[datetime.fromisoformat(d).date() for d in quote_request.preferred_dates],
            budget_range=quote_request.budget_range,
            urgency=quote_request.urgency,
            ai_suggested=bool(ai_suggestion),
            ai_confidence=ai_suggestion.confidence if ai_suggestion else None,
            ai_reasoning=ai_suggestion.reasoning if ai_suggestion else None,
            expires_at=datetime.utcnow() + timedelta(days=7)
        )
        
        # Save to database
        await db.quotes.insert_one(quote.dict(default=str))
        
        return {
            "quote_id": quote.id,
            "estimated_total": quote.total_amount,
            "expires_at": quote.expires_at,
            "ai_suggested": quote.ai_suggested,
            "items": [{"title": item.service_title, "price": item.total_price} for item in quote.items]
        }
        
    except Exception as e:
        logger.error(f"Quote request error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process quote request: {str(e)}"
        )

@api_router.get("/quotes", response_model=List[Quote])
async def get_user_quotes(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    status_filter: Optional[QuoteStatus] = None
):
    """Get quotes for current user"""
    current_user = await get_current_user(credentials, auth_handler)
    query = {"customer_id": current_user.id}
    if status_filter:
        query["status"] = status_filter
    
    quotes = await db.quotes.find(query).to_list(100)
    return [Quote(**quote) for quote in quotes]

@api_router.get("/quotes/{quote_id}", response_model=Quote)
async def get_quote(
    quote_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get a specific quote"""
    current_user = await get_current_user(credentials, auth_handler)
    quote = await db.quotes.find_one({"id": quote_id})
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    
    quote_obj = Quote(**quote)
    
    # Check access permissions
    if current_user.role == UserRole.CUSTOMER and quote_obj.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return quote_obj

@api_router.post("/quotes/{quote_id}/respond")
async def respond_to_quote(
    quote_id: str,
    response: QuoteResponse,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Accept or reject a quote"""
    current_user = await get_current_user(credentials, auth_handler)
    quote = await db.quotes.find_one({"id": quote_id, "customer_id": current_user.id})
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    
    quote_obj = Quote(**quote)
    
    if quote_obj.status != QuoteStatus.SENT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quote cannot be modified in current status"
        )
    
    # Update quote status
    new_status = QuoteStatus.ACCEPTED if response.accept else QuoteStatus.REJECTED
    await db.quotes.update_one(
        {"id": quote_id},
        {
            "$set": {
                "status": new_status,
                "responded_at": datetime.utcnow(),
                "customer_notes": response.customer_notes
            }
        }
    )
    
    return {"message": f"Quote {new_status}", "quote_id": quote_id}

# ==================== USER PROFILE ROUTES ====================

@api_router.post("/profile/addresses")
async def add_address(
    address: Address,
    current_user: User = Depends(lambda: get_current_user(auth_handler=auth_handler))
):
    """Add address to user profile"""
    # Geocode address if maps provider is available
    if maps_provider:
        try:
            geocode_result = await maps_provider.geocode(f"{address.street}, {address.city}, {address.state} {address.zip_code}")
            if geocode_result:
                address.latitude = geocode_result.latitude
                address.longitude = geocode_result.longitude
        except Exception as e:
            logger.warning(f"Geocoding failed: {e}")
    
    # Add address to user
    await db.users.update_one(
        {"id": current_user.id},
        {"$push": {"addresses": address.dict()}}
    )
    
    return {"message": "Address added successfully", "address_id": address.id}

@api_router.get("/profile/addresses", response_model=List[Address])
async def get_addresses(
    current_user: User = Depends(lambda: get_current_user(auth_handler=auth_handler))
):
    """Get user addresses"""
    return current_user.addresses

# ==================== ADMIN ROUTES ====================

@api_router.get("/admin/quotes", response_model=List[Quote])
async def get_all_quotes(
    current_user: User = Depends(require_admin),
    status_filter: Optional[QuoteStatus] = None,
    limit: int = 50
):
    """Get all quotes (admin only)"""
    query = {}
    if status_filter:
        query["status"] = status_filter
    
    quotes = await db.quotes.find(query).limit(limit).to_list(limit)
    return [Quote(**quote) for quote in quotes]

@api_router.post("/admin/quotes/{quote_id}/send")
async def send_quote(
    quote_id: str,
    current_user: User = Depends(require_admin)
):
    """Send quote to customer (admin only)"""
    quote = await db.quotes.find_one({"id": quote_id})
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")
    
    # Update quote status
    await db.quotes.update_one(
        {"id": quote_id},
        {
            "$set": {
                "status": QuoteStatus.SENT,
                "sent_at": datetime.utcnow()
            }
        }
    )
    
    # Send notification (mock for now)
    try:
        customer = await db.users.find_one({"id": quote["customer_id"]})
        if customer:
            await email_provider.send_email({
                "to": [customer["email"]],
                "subject": "Your estimate from The Real Johnson",
                "html_content": f"Your estimate is ready. Total: ${quote['total_amount']:.2f}"
            })
    except Exception as e:
        logger.warning(f"Failed to send notification: {e}")
    
    return {"message": "Quote sent successfully"}

# ==================== UTILITY ROUTES ====================

@api_router.get("/")
async def root():
    """API health check"""
    return {
        "message": "The Real Johnson Handyman Services API",
        "version": "1.0.0",
        "status": "running"
    }

@api_router.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "database": "connected",
        "ai_provider": "connected" if ai_provider else "unavailable"
    }

# Include the router in the main app
app.include_router(api_router)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_methods=["*"],
    allow_headers=["*"],
)

# Event handlers
@app.on_event("startup")
async def startup_event():
    """Initialize app on startup"""
    logger.info("Starting The Real Johnson Handyman Services API...")
    
    # Create indexes for better performance
    try:
        await db.users.create_index("email", unique=True)
        await db.quotes.create_index("customer_id")
        await db.quotes.create_index("status")
        await db.services.create_index("category")
        logger.info("Database indexes created successfully")
    except Exception as e:
        logger.warning(f"Index creation warning: {e}")
    
    # Insert default services if none exist
    service_count = await db.services.count_documents({})
    if service_count == 0:
        await seed_default_services()

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("Shutting down API...")
    client.close()

# Helper function to seed default services
async def seed_default_services():
    """Seed database with default handyman services"""
    default_services = [
        {
            "category": ServiceCategory.DRYWALL,
            "title": "Drywall Patch & Repair",
            "description": "Professional drywall patching and repair services for holes, cracks, and damage",
            "pricing_model": PricingModel.UNIT,
            "base_price": 25.0,
            "unit_label": "per patch",
            "typical_duration": 120,
            "min_charge": 75.0,
            "labor_multiplier": 1.0
        },
        {
            "category": ServiceCategory.PAINTING,
            "title": "Interior Painting",
            "description": "Quality interior painting services for rooms, walls, and trim",
            "pricing_model": PricingModel.HOURLY,
            "base_price": 95.0,
            "unit_label": "per hour",
            "typical_duration": 240,
            "min_charge": 150.0,
            "labor_multiplier": 1.0
        },
        {
            "category": ServiceCategory.ELECTRICAL,
            "title": "Outlet Installation",
            "description": "Safe installation of electrical outlets and switches",
            "pricing_model": PricingModel.FLAT,
            "base_price": 120.0,
            "unit_label": "per outlet",
            "typical_duration": 90,
            "min_charge": 120.0,
            "labor_multiplier": 1.2
        },
        {
            "category": ServiceCategory.PLUMBING,
            "title": "Faucet Repair/Installation",
            "description": "Faucet repair and installation services for kitchen and bathroom",
            "pricing_model": PricingModel.FLAT,
            "base_price": 140.0,
            "unit_label": "per fixture",
            "typical_duration": 105,
            "min_charge": 100.0,
            "labor_multiplier": 1.1
        },
        {
            "category": ServiceCategory.CARPENTRY,
            "title": "Door & Trim Repair",
            "description": "Repair and installation of doors, trim, and molding",
            "pricing_model": PricingModel.HOURLY,
            "base_price": 95.0,
            "unit_label": "per hour",
            "typical_duration": 180,
            "min_charge": 120.0,
            "labor_multiplier": 1.0
        }
    ]
    
    for service_data in default_services:
        service = Service(**service_data)
        service.created_at = datetime.utcnow()
        service.updated_at = datetime.utcnow()
        await db.services.insert_one(service.dict())
    
    logger.info(f"Seeded {len(default_services)} default services")

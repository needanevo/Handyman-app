from fastapi import FastAPI, APIRouter, HTTPException, status, Depends, Body, Request, UploadFile, File, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from .providers import EMAIL_PROVIDERS, AI_PROVIDERS, MAPS_PROVIDERS
from fastapi.responses import RedirectResponse
from .providers.linode_storage_provider import LinodeObjectStorage
from .providers.quote_email_service import QuoteEmailService



load_dotenv("backend/providers/providers.env")
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta, date
import uuid

# Import models
from .models import (
    User,
    UserCreate,
    UserLogin,
    Token,
    UserRole,
    Address,
    Service,
    ServiceCreate,
    ServiceCategory,
    PricingModel,
    Quote,
    QuoteRequest,
    QuoteResponse,
    QuoteStatus,
    QuoteItem,
)

# Import authentication
from .auth.auth_handler import (
    AuthHandler,
    get_current_user,
    require_admin,
    require_technician_or_admin,
)

# Import services
# Import services
from .services.pricing_engine import PricingEngine

# Import providers
from .providers.openai_provider import OpenAiProvider
from .providers.base import AiQuoteSuggestion, ProviderError

# --- Environment Variable Loading ---
# Build the absolute path to the providers.env file
# This is robust and will work regardless of where the app is started from
PROJ_ROOT = Path(__file__).parent.parent # This is the Handyman-app-main directory
load_dotenv(PROJ_ROOT / "backend/providers/providers.env")
# --- End Environment Loading ---

# MongoDB connection
mongo_url = os.environ["MONGO_URL"]
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ["DB_NAME"]]

# Initialize services and providers
auth_handler = AuthHandler(db)
pricing_engine = PricingEngine()

# Initialize providers based on feature flags
active_ai = (
    os.getenv("ACTIVE_AI_PROVIDER", "demo")
    if os.getenv("FEATURE_AI_QUOTE_ENABLED", "true").lower() == "true"
    else "demo"
)
ai_provider = AI_PROVIDERS[active_ai]()
email_provider = EMAIL_PROVIDERS[os.getenv("ACTIVE_EMAIL_PROVIDER", "mock")]()
maps_provider = MAPS_PROVIDERS[os.getenv("ACTIVE_MAPS_PROVIDER", "google")]()
storage_provider = LinodeObjectStorage()
quote_email_service = QuoteEmailService()

# Create the main app
app = FastAPI(
    title="The Real Johnson Handyman Services API",
    description="Professional handyman booking and management system",
    version="1.0.0",
)

# Create API router
api_router = APIRouter(prefix="/api")

# Security
security = HTTPBearer()

# Configure logging
logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# ==================== AUTHENTICATION ROUTES ====================

@api_router.post("/auth/register", response_model=Token)
async def register_user(user_data: UserCreate):
    try:
        if await auth_handler.get_user_by_email(user_data.email):
            raise HTTPException(409, detail="Looks like you already have an account. Try logging in, or use Forgot Password.")
        
        # Generate user_id FIRST before creating the User object
        user_id = str(uuid.uuid4())
        
        user = User(
            id=user_id,  # ← Explicitly set the ID
            email=user_data.email, 
            phone=user_data.phone, 
            first_name=user_data.firstName,
            last_name=user_data.lastName, 
            role=user_data.role, 
            marketing_opt_in=user_data.marketingOptIn,
            created_at=datetime.utcnow(), 
            updated_at=datetime.utcnow()
        )
        
        user_doc = user.model_dump()
        user_doc["created_at"] = user_doc["created_at"].isoformat()
        user_doc["updated_at"] = user_doc["updated_at"].isoformat()
        
        await db.users.insert_one(user_doc)
        await auth_handler.create_user_password(user_id, user_data.password)
        
        return Token(
            access_token=auth_handler.create_access_token({"user_id": user_id, "email": user.email, "role": user.role}),
            refresh_token=auth_handler.create_refresh_token({"user_id": user_id, "email": user.email})
        )
    except HTTPException: 
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(500, detail=f"Failed to create user: {e}")




@api_router.post("/auth/login", response_model=Token)
async def login_user(login_data: UserLogin):
    """Login user and return tokens"""
    user = await auth_handler.authenticate_user(login_data.email, login_data.password)
    if not user:
        raise HTTPException(401, detail="That email or password didn't match. Please try again or use Forgot Password.")
    

    access_token = auth_handler.create_access_token(
        data={"user_id": user.id, "email": user.email, "role": user.role}
    )
    refresh_token = auth_handler.create_refresh_token(
        data={"user_id": user.id, "email": user.email}
    )

    return Token(access_token=access_token, refresh_token=refresh_token)


async def get_current_user_dependency(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    """Dependency wrapper to inject auth_handler"""
    payload = auth_handler.verify_token(credentials.credentials)
    user_id = payload.get("user_id")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload"
        )

    user = await auth_handler.get_user_by_id(user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Inactive user"
        )

    return user


@api_router.get("/auth/me", response_model=User)
async def get_current_user_info(
    current_user: User = Depends(get_current_user_dependency),
):
    """Get current user information"""
    return current_user


# ==================== SERVICE CATALOG ROUTES ====================


@api_router.get("/services", response_model=List[Service])
async def get_services(
    category: Optional[ServiceCategory] = None, active_only: bool = True
):
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
    service_data: ServiceCreate, current_user: User = Depends(require_admin)
):
    """Create a new service (admin only)"""
    service = Service(**service_data.dict())
    service.created_at = datetime.utcnow()
    service.updated_at = datetime.utcnow()

    await db.services.insert_one(service.dict())
    return service


# ==================== QUOTE ROUTES ====================
# >>> PHOTO_DEBUG_START
@api_router.post("/photo")
async def debug_photo(request: Request, file: UploadFile = File(...)):
    sp = request.app.state.storage if hasattr(request.app.state, "storage") else None
    if not sp:
        raise HTTPException(500, "Storage provider not initialized")
    data = await file.read()
    logger.info(f"📸 /photo: name={file.filename}, bytes={len(data)}")
    key = f"debug/{uuid.uuid4()}_{file.filename}"
    url = await sp.upload_photo_bytes(data, key)
    logger.info(f"✅ /photo uploaded: {url}")
    return {"url": url, "key": key}
# <<< PHOTO_DEBUG_END
@api_router.post("/photos/upload")
async def upload_photo_immediately(
    file: UploadFile = File(...),
    customer_id: str = Form(...),
):
    """
    Upload photo immediately when taken and return Linode URL
    This uploads right away, not waiting for quote submission
    """
    try:
        # Validate it's an image
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read the file data
        file_data = await file.read()
        
        # Create temp quote ID (will be organized later when actual quote is created)
        temp_quote_id = f"temp_{str(uuid.uuid4())}"
        
        # Get file extension
        file_extension = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
        filename = f"photo_{uuid.uuid4().hex[:8]}.{file_extension}"
        
        # Upload using the NEW method in linode_storage_provider.py
        url = await storage_provider.upload_photo_direct(
            file_data=file_data,
            customer_id=customer_id,
            quote_id=temp_quote_id,
            filename=filename,
            content_type=file.content_type
        )
        
        logger.info(f"Photo uploaded immediately: {url}")
        
        return {
            "success": True,
            "url": url,
            "temp_quote_id": temp_quote_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Immediate photo upload failed: {e}")
        raise HTTPException(status_code=500, detail=f"Photo upload failed: {str(e)}")

@api_router.post("/quotes/request")
async def request_quote(
    quote_request: QuoteRequest,
    current_user: User = Depends(get_current_user_dependency),
):
    """
    Request a quote for services with photo upload to Linode and email notification
    """
    try:
        quote_id = str(uuid.uuid4())
        
        # Step 1: Upload photos to Linode Object Storage
        photo_urls = []
        if quote_request.photos:
            logger.info(f"Uploading {len(quote_request.photos)} photos to Linode...")
            try:
                photo_urls = await storage_provider.upload_multiple_photos(
                    photos=quote_request.photos,
                    customer_id=current_user.id,
                    quote_id=quote_id
                )
                logger.info(f"Successfully uploaded photos: {photo_urls}")
            except Exception as e:
                logger.error(f"Photo upload failed: {e}")
                # Continue without photos rather than failing the entire request
                photo_urls = []
        
        # Step 2: Get AI suggestion if enabled
        ai_suggestion = None
        ai_suggestion_dict = None
        if os.getenv("FEATURE_AI_QUOTE_ENABLED", "true").lower() == "true":
            try:
                ai_suggestion = await ai_provider.generate_quote_suggestion(
                    service_type=quote_request.service_category,
                    description=quote_request.description,
                    photos_metadata=[f"photo_{i}" for i in range(len(quote_request.photos))],
                )
                
                # Convert to dict for email
                ai_suggestion_dict = {
                    'estimated_hours': ai_suggestion.estimated_hours,
                    'suggested_materials': ai_suggestion.suggested_materials,
                    'complexity_rating': ai_suggestion.complexity_rating,
                    'base_price_suggestion': ai_suggestion.base_price_suggestion,
                    'reasoning': ai_suggestion.reasoning,
                    'confidence': ai_suggestion.confidence
                }
                
                logger.info(f"AI suggestion generated with {ai_suggestion.confidence:.0%} confidence")
            except Exception as e:
                logger.warning(f"AI quote generation failed: {e}")
        
        # Step 3: Calculate pricing using AI suggestion or fallback to default
        base_price = (
            ai_suggestion.base_price_suggestion
            if ai_suggestion
            else pricing_engine.get_base_price(quote_request.service_category)
        )
        
        estimated_hours = (
            ai_suggestion.estimated_hours
            if ai_suggestion
            else pricing_engine.estimate_hours(quote_request.service_category)
        )
        
        # Calculate totals
        subtotal = base_price
        trip_fee = 0.0  # Can be calculated based on address
        tax_rate = 0.08  # 8% - adjust based on location
        tax_amount = subtotal * tax_rate
        total_amount = subtotal + trip_fee + tax_amount
        
        # Step 4: Create quote in database
        quote = Quote(
            id=quote_id,
            customer_id=current_user.id,
            address_id=quote_request.address_id,
            items=[
                QuoteItem(
                    service_id=str(uuid.uuid4()),
                    service_title=quote_request.service_category,
                    description=quote_request.description,
                    quantity=1.0,
                    unit_price=base_price,
                    total_price=base_price,
                )
            ],
            subtotal=subtotal,
            tax_rate=tax_rate,
            tax_amount=tax_amount,
            trip_fee=trip_fee,
            total_amount=total_amount,
            description=quote_request.description,
            photos=photo_urls,  # Store Linode URLs instead of base64
            preferred_dates=[
                datetime.fromisoformat(d).date() for d in quote_request.preferred_dates
            ]
            if quote_request.preferred_dates
            else [],
            budget_range=quote_request.budget_range,
            urgency=quote_request.urgency,
            ai_suggested=ai_suggestion is not None,
            ai_confidence=ai_suggestion.confidence if ai_suggestion else None,
            ai_reasoning=ai_suggestion.reasoning if ai_suggestion else None,
            status=QuoteStatus.DRAFT,
        )
        
        # Save to database
        quote_dict = quote.model_dump()
        
        # Convert dates to ISO format for MongoDB
        quote_dict["created_at"] = quote_dict["created_at"].isoformat()
        quote_dict["updated_at"] = quote_dict["updated_at"].isoformat()
        if quote_dict.get("preferred_dates"):
            quote_dict["preferred_dates"] = [
                d.isoformat() for d in quote_dict["preferred_dates"]
            ]
        
        await db.quotes.insert_one(quote_dict)
        logger.info(f"Quote {quote_id} created and saved to database")
        
        # Step 5: Send immediate confirmation email to customer
        try:
            customer_name = f"{current_user.first_name} {current_user.last_name}"
            await quote_email_service.send_quote_received_notification(
                to_email=current_user.email,
                customer_name=customer_name,
                service_category=quote_request.service_category
            )
            logger.info(f"Confirmation email sent to {current_user.email}")
        except Exception as e:
            logger.warning(f"Failed to send confirmation email: {e}")
        
        # Step 6: Prepare customer request data for admin/future email
        customer_request_data = {
            'description': quote_request.description,
            'service_category': quote_request.service_category,
            'urgency': quote_request.urgency,
            'preferred_dates': quote_request.preferred_dates,
            'photo_urls': photo_urls
        }
        
        return {
            "quote_id": quote.id,
            "status": quote.status,
            "total_amount": quote.total_amount,
            "estimated_hours": estimated_hours,
            "ai_confidence": ai_suggestion.confidence if ai_suggestion else None,
            "photo_urls": photo_urls,
            "message": "Quote request received! We'll send you a detailed estimate within 24 hours.",
        }
        
    except Exception as e:
        logger.error(f"Quote request failed: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(500, detail=f"Failed to process quote request: {str(e)}")


# ==================== NEW ENDPOINT: Send Quote Email ====================

@api_router.post("/admin/quotes/{quote_id}/send-email")
async def send_quote_email_endpoint(
    quote_id: str, 
    current_user: User = Depends(require_admin)
):
    """
    Send detailed quote email to customer (admin only)
    This sends the full quote with AI analysis and all details
    """
    try:
        # Get quote from database
        quote_doc = await db.quotes.find_one({"id": quote_id})
        if not quote_doc:
            raise HTTPException(status_code=404, detail="Quote not found")
        
        # Get customer details
        customer = await db.users.find_one({"id": quote_doc["customer_id"]})
        if not customer:
            raise HTTPException(status_code=404, detail="Customer not found")
        
        # Prepare quote data for email
        quote_data = {
            'id': quote_doc['id'],
            'items': quote_doc['items'],
            'subtotal': quote_doc['subtotal'],
            'tax_rate': quote_doc['tax_rate'],
            'tax_amount': quote_doc['tax_amount'],
            'trip_fee': quote_doc['trip_fee'],
            'total_amount': quote_doc['total_amount']
        }
        
        # Prepare AI suggestion data if available
        ai_suggestion_data = None
        if quote_doc.get('ai_suggested'):
            ai_suggestion_data = {
                'estimated_hours': quote_doc.get('ai_reasoning', '').split('hours')[0] if 'hours' in quote_doc.get('ai_reasoning', '') else 'N/A',
                'suggested_materials': ['Materials will be determined during service'],  # Extract from reasoning if needed
                'complexity_rating': 3,  # Could calculate from AI data
                'reasoning': quote_doc.get('ai_reasoning', ''),
                'confidence': quote_doc.get('ai_confidence', 0)
            }
        
        # Prepare customer request data
        customer_request_data = {
            'description': quote_doc.get('description', ''),
            'service_category': quote_doc['items'][0]['service_title'] if quote_doc.get('items') else 'N/A',
            'urgency': quote_doc.get('urgency', 'normal'),
            'preferred_dates': [d for d in quote_doc.get('preferred_dates', [])],
            'photo_urls': quote_doc.get('photos', [])
        }
        
        # Send email
        customer_name = f"{customer.get('first_name', '')} {customer.get('last_name', '')}"
        success = await quote_email_service.send_quote_email(
            to_email=customer['email'],
            customer_name=customer_name,
            quote_data=quote_data,
            ai_suggestion=ai_suggestion_data,
            customer_request=customer_request_data
        )
        
        if success:
            # Update quote status
            await db.quotes.update_one(
                {"id": quote_id},
                {
                    "$set": {
                        "status": QuoteStatus.SENT,
                        "sent_at": datetime.utcnow().isoformat()
                    }
                }
            )
            
            return {
                "message": "Quote email sent successfully",
                "quote_id": quote_id,
                "sent_to": customer['email']
            }
        else:
            raise HTTPException(500, detail="Failed to send email")
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to send quote email: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(500, detail=f"Failed to send quote email: {str(e)}")



@api_router.get("/quotes", response_model=List[Quote])
async def get_user_quotes(
    current_user: User = Depends(get_current_user_dependency),
    status_filter: Optional[QuoteStatus] = None,
):
    """Get quotes for current user"""
    query = {"customer_id": current_user.id}
    if status_filter:
        query["status"] = status_filter

    quotes = await db.quotes.find(query).to_list(100)
    return [Quote(**quote) for quote in quotes]


@api_router.get("/quotes/{quote_id}", response_model=Quote)
async def get_quote(
    quote_id: str, current_user: User = Depends(get_current_user_dependency)
):
    """Get a specific quote"""
    quote = await db.quotes.find_one({"id": quote_id})
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")

    quote_obj = Quote(**quote)

    # Check access permissions
    if (
        current_user.role == UserRole.CUSTOMER
        and quote_obj.customer_id != current_user.id
    ):
        raise HTTPException(status_code=403, detail="Access denied")

    return quote_obj


@api_router.post("/quotes/{quote_id}/respond")
async def respond_to_quote(
    quote_id: str,
    response: QuoteResponse,
    current_user: User = Depends(get_current_user_dependency),
):
    """Accept or reject a quote"""
    quote = await db.quotes.find_one({"id": quote_id, "customer_id": current_user.id})
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")

    quote_obj = Quote(**quote)

    if quote_obj.status != QuoteStatus.SENT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Quote cannot be modified in current status",
        )

    # Update quote status
    new_status = QuoteStatus.ACCEPTED if response.accept else QuoteStatus.REJECTED
    await db.quotes.update_one(
        {"id": quote_id},
        {
            "$set": {
                "status": new_status,
                "responded_at": datetime.utcnow(),
                "customer_notes": response.customer_notes,
            }
        },
    )

    return {"message": f"Quote {new_status}", "quote_id": quote_id}


# ==================== USER PROFILE ROUTES ====================


@api_router.post("/profile/addresses")
async def add_address(
    address: Address, current_user: User = Depends(get_current_user_dependency)
):
    """Add address to user profile"""
    # Geocode address if maps provider is available
    if maps_provider:
        try:
            geocode_result = await maps_provider.geocode(
                f"{address.street}, {address.city}, {address.state} {address.zip_code}"
            )
            if geocode_result:
                address.latitude = geocode_result["latitude"]
                address.longitude = geocode_result["longitude"]
        except Exception as e:
            logger.warning(f"Geocoding failed: {e}")

    # Add address to user
    await db.users.update_one(
        {"id": current_user.id}, {"$push": {"addresses": address.dict()}}
    )

    return {"message": "Address added successfully", "address_id": address.id}


@api_router.get("/profile/addresses", response_model=List[Address])
async def get_addresses(current_user: User = Depends(get_current_user_dependency)):
    """Get user addresses"""
    return current_user.addresses


# ==================== ADMIN ROUTES ====================


@api_router.get("/admin/quotes", response_model=List[Quote])
async def get_all_quotes(
    current_user: User = Depends(require_admin),
    status_filter: Optional[QuoteStatus] = None,
    limit: int = 50,
):
    """Get all quotes (admin only)"""
    query = {}
    if status_filter:
        query["status"] = status_filter

    quotes = await db.quotes.find(query).limit(limit).to_list(limit)
    return [Quote(**quote) for quote in quotes]


@api_router.post("/admin/quotes/{quote_id}/send")
async def send_quote(quote_id: str, current_user: User = Depends(require_admin)):
    """Send quote to customer (admin only)"""
    quote = await db.quotes.find_one({"id": quote_id})
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")

    # Update quote status
    await db.quotes.update_one(
        {"id": quote_id},
        {"$set": {"status": QuoteStatus.SENT, "sent_at": datetime.utcnow()}},
    )

    # Send notification (mock for now)
    try:
        customer = await db.users.find_one({"id": quote["customer_id"]})
        if customer:
            await email_provider.send_email(
                {
                    "to": [customer["email"]],
                    "subject": "Your estimate from The Real Johnson",
                    "html_content": f"Your estimate is ready. Total: ${quote['total_amount']:.2f}",
                }  # type: ignore
            )
    except Exception as e:
        logger.warning(f"Failed to send notification: {e}")

    return {"message": "Quote sent successfully"}


# ==================== UTILITY ROUTES ====================


@api_router.get("/")
async def root(): # type: ignore
    """API health check"""
    return {
        "message": "The Real Johnson Handyman Services API",
        "version": "1.0.0",
        "status": "running",
    }


@api_router.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "database": "connected",
        "ai_provider": "connected" if ai_provider else "unavailable",
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
            "labor_multiplier": 1.0,
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
            "labor_multiplier": 1.0,
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
            "labor_multiplier": 1.2,
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
            "labor_multiplier": 1.1,
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
            "labor_multiplier": 1.0,
        },
    ]

    for service_data in default_services:
        service = Service(**service_data)
        service.created_at = datetime.utcnow()
        service.updated_at = datetime.utcnow()
        await db.services.insert_one(service.dict())

    logger.info(f"Seeded {len(default_services)} default services")

    
@app.get("/")
def root():
    return RedirectResponse(url="/api/health", status_code=307)


@api_router.post("/auth/refresh", response_model=Token)
async def refresh_token(refresh_token: str = Body(..., embed=True)):
    """
    Refresh access token using refresh token
    """
    try:
        # Verify refresh token
        payload = auth_handler.verify_token(refresh_token, token_type="refresh")
        user_id = payload.get("user_id")
        email = payload.get("email")
        
        if not user_id or not email:
            raise HTTPException(401, "Invalid refresh token")
        
        # Get user to verify they still exist and are active
        user = await auth_handler.get_user_by_id(user_id)
        if not user:
            raise HTTPException(401, "User not found")
        
        # Create new tokens
        access_token = auth_handler.create_access_token({
            "user_id": user_id,
            "email": email,
            "role": user.role
        })
        
        new_refresh_token = auth_handler.create_refresh_token({
            "user_id": user_id,
            "email": email
        })
        
        return Token(
            access_token=access_token,
            refresh_token=new_refresh_token
        )
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(401, "Refresh token expired")
    except jwt.JWTError:
        raise HTTPException(401, "Invalid refresh token")
    except Exception as e:
        logger.error(f"Token refresh error: {e}")
        raise HTTPException(500, "Token refresh failed")

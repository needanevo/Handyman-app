from fastapi import FastAPI, APIRouter, HTTPException, status, Depends, Body, Request, UploadFile, File, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials, HTTPBasic, HTTPBasicCredentials
from pydantic import BaseModel
from dotenv import load_dotenv
from providers import EMAIL_PROVIDERS, AI_PROVIDERS, MAPS_PROVIDERS
from fastapi.responses import RedirectResponse
from providers.linode_storage_provider import LinodeObjectStorage
from providers.quote_email_service import QuoteEmailService
from models.address import Address, AddressInput



load_dotenv("backend/providers/providers.env")
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import secrets
import logging
from pathlib import Path
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta, date
import uuid
from utils.provider_completeness import compute_provider_completeness
from utils.provider_status import compute_new_status

# Import models
from models import (
    User,
    UserCreate,
    UserLogin,
    Token,
    UserRole,
    Address,
    EmbeddedAddress,
    Service,
    ServiceCreate,
    ServiceCategory,
    PricingModel,
    Quote,
    QuoteRequest,
    QuoteResponse,
    QuoteStatus,
    QuoteItem,
    Job,
    JobStatus,
    JobCreateRequest,
    JobStatusUpdate,
    JobUpdate,
    JobCreateResponse,
    ContractorTypePreference,
    JobAddress,
    Proposal,
    ProposalStatus,
    ProposalCreateRequest,
    ProposalResponse,
    ContractorRole,
    Payout,
    PayoutStatus,
    WalletSummary,
    GrowthSummary,
    GrowthSummaryResponse,
    MileageLog,
    MileageCreateRequest,
    TimeLog,
    TimeLogStartRequest,
    TimeLogStopRequest,
    JobPhoto,
    JobPhotoUpdateRequest,
    MonthlyReport,
    YearlyReport,
    TaxReport,
    WarrantyRequest,
    WarrantyRequestCreate,
    WarrantyDecision,
    WarrantyStatus,
    ChangeOrder,
    ChangeOrderCreate,
    ChangeOrderDecision,
    ChangeOrderStatus,
)
# Job models imported from models/__init__.py above

# Import authentication
from auth.auth_handler import (
    AuthHandler,
    require_admin,
    require_technician_or_admin,
)

# Import services
from services.pricing_engine import PricingEngine
from services.contractor_routing import ContractorRouter
from services.job_lifecycle import JobLifecycleService
from services.proposal_service import ProposalService
from services.job_feed_service import JobFeedService
from services.payout_service import PayoutService
from services.growth_service import GrowthService

# Import providers
from providers.openai_provider import OpenAiProvider
from providers.base import AiQuoteSuggestion, ProviderError

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
contractor_router = ContractorRouter(db)

# Initialize Phase 4 services
job_lifecycle = JobLifecycleService(db)
proposal_service = ProposalService(db)
job_feed_service = JobFeedService(db)
payout_service = PayoutService(db)
growth_service = GrowthService(db)

# Initialize providers based on feature flags
active_ai = (
    os.getenv("ACTIVE_AI_PROVIDER", "mock")
    if os.getenv("FEATURE_AI_QUOTE_ENABLED", "true").lower() == "true"
    else "mock"
)
ai_provider = AI_PROVIDERS[active_ai]()
email_provider = EMAIL_PROVIDERS[os.getenv("ACTIVE_EMAIL_PROVIDER", "mock")]()
maps_provider = MAPS_PROVIDERS[os.getenv("ACTIVE_MAPS_PROVIDER", "google")]()
storage_provider = LinodeObjectStorage()
quote_email_service = QuoteEmailService()

# Admin email for notifications
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@therealjohnson.com")

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
        # DEBUG: Log incoming registration data
        logger.info(f"[REGISTER] Email: {user_data.email}, Role: {user_data.role}")
        logger.info(f"[REGISTER] Address provided: {user_data.address is not None}")
        if user_data.address:
            logger.info(f"[REGISTER] Address data: street={user_data.address.street}, city={user_data.address.city}, state={user_data.address.state}, zip={user_data.address.zipCode}")

        # Check if email already exists BEFORE attempting creation
        if await auth_handler.get_user_by_email(user_data.email):
            raise HTTPException(400, detail="Email already registered. Please try logging in or use Forgot Password.")

        # Generate user_id FIRST before creating the User object
        user_id = str(uuid.uuid4())

        # Initialize verification tracking and provider status for providers
        verification_fields = {}
        if user_data.role in [UserRole.CONTRACTOR, UserRole.HANDYMAN]:
            now = datetime.utcnow()
            verification_fields = {
                "address_verification_status": "pending",
                "address_verification_started_at": now,
                "address_verification_deadline": now + timedelta(days=10),
                "provider_status": "draft",  # Phase 5B: draft → submitted → active
                "provider_completeness": 0,
            }

        # Handle address if provided (typically for customer registration)
        addresses = []
        if user_data.address:
            address_id = str(uuid.uuid4())
            addresses = [{
                "id": address_id,
                "street": user_data.address.street,
                "city": user_data.address.city,
                "state": user_data.address.state,
                "zip_code": user_data.address.zipCode,
                "is_default": True,
                "latitude": None,
                "longitude": None
            }]
            logger.info(f"[REGISTER] Created addresses array with {len(addresses)} address(es)")

        user = User(
            id=user_id,  # ← Explicitly set the ID
            email=user_data.email,
            phone=user_data.phone,
            first_name=user_data.firstName,
            last_name=user_data.lastName,
            role=user_data.role,
            marketing_opt_in=user_data.marketingOptIn,
            business_name=user_data.businessName if user_data.businessName else None,
            addresses=addresses,  # Set addresses during registration
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            **verification_fields
        )

        user_doc = user.model_dump()
        user_doc["created_at"] = user_doc["created_at"].isoformat()
        user_doc["updated_at"] = user_doc["updated_at"].isoformat()

        # Serialize verification datetime fields if present
        if user_doc.get("address_verification_started_at"):
            user_doc["address_verification_started_at"] = user_doc["address_verification_started_at"].isoformat()
        if user_doc.get("address_verification_deadline"):
            user_doc["address_verification_deadline"] = user_doc["address_verification_deadline"].isoformat()

        # DEBUG: Log addresses before DB insertion
        logger.info(f"[REGISTER] user_doc addresses before DB insert: {user_doc.get('addresses', [])}")

        await db.users.insert_one(user_doc)
        logger.info(f"[REGISTER] User {user_id} inserted into database")
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
        # Check if it's a MongoDB duplicate key error
        if "duplicate key error" in str(e).lower() or "E11000" in str(e):
            raise HTTPException(400, detail="Email already registered. Please try logging in.")
        raise HTTPException(500, detail=f"Failed to create user: {str(e)}")




@api_router.post("/auth/login", response_model=Token)
async def login_user(login_data: UserLogin):
    """Login user and return tokens"""
    try:
        user = await auth_handler.authenticate_user(login_data.email, login_data.password)
        if not user:
            raise HTTPException(401, detail="That email or password didn't match. Please try again or use Forgot Password.")

        # Check and update provider status on login (deadline enforcement)
        if user.role in ["handyman", "contractor"]:
            user_dict = user.model_dump()
            completeness = compute_provider_completeness(user_dict)
            new_status = compute_new_status(
                current_status=user_dict.get("provider_status", "draft"),
                completeness=completeness,
                address_verification_status=user_dict.get("address_verification_status", "pending"),
                address_verification_deadline=user_dict.get("address_verification_deadline")
            )

            # Update status if changed
            if new_status != user_dict.get("provider_status"):
                await db.users.update_one(
                    {"id": user.id},
                    {"$set": {"provider_status": new_status}}
                )
                logger.info(f"Provider status updated on login for {user.id}: {user_dict.get('provider_status')} → {new_status}")

        access_token = auth_handler.create_access_token(
            data={"user_id": user.id, "email": user.email, "role": user.role}
        )
        refresh_token = auth_handler.create_refresh_token(
            data={"user_id": user.id, "email": user.email}
        )

        return Token(access_token=access_token, refresh_token=refresh_token)
    except HTTPException:
        raise
    except Exception as e:
        # Log the error for debugging but don't expose internal details
        logger.error(f"Login error for {login_data.email}: {str(e)}")
        # Return 401 for any authentication failures (security: don't expose DB/model errors)
        raise HTTPException(401, detail="Invalid email or password")


async def get_current_user_dependency(
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    """Dependency wrapper to inject auth_handler"""
    try:
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
    except HTTPException:
        raise
    except Exception as e:
        # Log error but don't expose internal details
        logger.error(f"User authentication error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication failed"
        )


@api_router.get("/auth/me")
async def get_current_user_info(
    current_user: User = Depends(get_current_user_dependency),
):
    """
    Get current user information with role-based field filtering.

    Returns only fields appropriate for the user's role:
    - Customers: Basic profile fields only (no contractor data)
    - Handyman/Technician: Includes business, skills, documents, portfolio
    """
    try:
        user_dict = current_user.model_dump()

        # Compute fresh provider_completeness and check status for providers
        if current_user.role in [UserRole.HANDYMAN, UserRole.CONTRACTOR]:
            completeness = compute_provider_completeness(user_dict)
            user_dict['provider_completeness'] = completeness

            # Check and update provider_status (including deadline enforcement)
            new_status = compute_new_status(
                current_status=user_dict.get("provider_status", "draft"),
                completeness=completeness,
                address_verification_status=user_dict.get("address_verification_status", "pending"),
                address_verification_deadline=user_dict.get("address_verification_deadline")
            )

            # If status changed, update in database and return dict
            if new_status != user_dict.get("provider_status"):
                await db.users.update_one(
                    {"id": current_user.id},
                    {"$set": {"provider_status": new_status}}
                )
                user_dict['provider_status'] = new_status
                logger.info(f"Provider status updated for {current_user.id}: {user_dict.get('provider_status')} → {new_status}")

        # Define contractor/handyman-specific fields to filter
        contractor_fields = [
            'business_name', 'hourly_rate', 'skills', 'available_hours',
            'years_experience', 'service_areas', 'documents', 'portfolio_photos',
            'has_llc', 'llc_formation_date', 'is_licensed', 'license_number',
            'license_state', 'license_expiry', 'is_insured', 'insurance_policy_number',
            'insurance_expiry', 'upgrade_to_technician_date', 'registration_completed_date',
            'registration_status'
        ]

        # Filter fields based on role
        if current_user.role == UserRole.CUSTOMER:
            # Remove ALL contractor/handyman fields for customers
            for field in contractor_fields:
                user_dict.pop(field, None)

            # Also remove customer_notes and tags (internal use only)
            user_dict.pop('customer_notes', None)
            user_dict.pop('tags', None)

        # For handyman/technician roles, include all fields (no filtering needed)
        # For admin, include all fields as well

        return user_dict
    except Exception as e:
        # Log error but don't expose internal details
        logger.error(f"Error fetching user info: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve user information"
        )


@api_router.get("/auth/test")
async def test_auth(
    current_user: User = Depends(get_current_user_dependency),
):
    """
    Test auth endpoint to verify authentication status.
    Returns auth status, user_id, and role.
    """
    return {
        "auth": True,
        "user_id": current_user.id,
        "role": current_user.role
    }


@api_router.post("/auth/refresh", response_model=Token)
async def refresh_token(refresh: dict = Body(...)):
    """
    Refresh access token using proper refresh-token decoder
    """
    try:
        refresh_token = refresh.get("refresh_token")
        if not refresh_token:
            raise HTTPException(400, "refresh_token is required")

        # Correct decoder — built for REFRESH tokens only
        payload = auth_handler.decode_refresh_token(refresh_token)

        user_id = payload.get("user_id")
        email = payload.get("email")

        if not user_id or not email:
            raise HTTPException(401, "Invalid refresh token")

        # Verify user still exists
        user = await auth_handler.get_user_by_id(user_id)
        if not user:
            raise HTTPException(401, "User not found")

        # Create new tokens
        new_access = auth_handler.create_access_token({
            "user_id": user_id,
            "email": email,
            "role": user.role
        })

        new_refresh = auth_handler.create_refresh_token({
            "user_id": user_id,
            "email": email
        })

        return Token(access_token=new_access, refresh_token=new_refresh)

    except Exception as e:
        logger.error(f"Refresh error: {e}")
        raise HTTPException(401, "Invalid refresh token")


# ==================== CUSTOMER LOCATION VERIFICATION ROUTES ====================



# ==================== ONBOARDING STEP TRACKING (Phase 5B-1) ====================

@api_router.post("/auth/onboarding/step")
async def update_onboarding_step(
    step: int,
    current_user: User = Depends(get_current_user_dependency)
):
    """
    Update user's current onboarding step (Phase 5B-1 requirement).

    Call this after each registration step completes successfully.
    Steps 1-5 for both handymen and contractors.
    """
    if step < 1 or step > 5:
        raise HTTPException(400, detail="Invalid step number. Must be 1-5.")

    # Only providers need onboarding tracking
    if current_user.role not in [UserRole.HANDYMAN, UserRole.CONTRACTOR]:
        raise HTTPException(400, detail="Onboarding tracking only applies to providers")

    # Update step in database
    await db.users.update_one(
        {"id": current_user.id},
        {
            "$set": {
                "onboarding_step": step,
                "updated_at": datetime.utcnow()
            }
        }
    )

    logger.info(f"User {current_user.id} ({current_user.role}) completed onboarding step {step}")

    return {"success": True, "step": step, "message": f"Step {step} saved"}


@api_router.post("/auth/onboarding/complete")
async def complete_onboarding(
    current_user: User = Depends(get_current_user_dependency)
):
    """
    Mark onboarding as fully complete (Phase 5B-1 requirement).

    Call this when user confirms final step (step 5).
    Sets onboarding_completed=True and onboarding_step=None.
    """
    # Only providers need onboarding tracking
    if current_user.role not in [UserRole.HANDYMAN, UserRole.CONTRACTOR]:
        raise HTTPException(400, detail="Onboarding completion only applies to providers")

    # Mark onboarding as complete
    await db.users.update_one(
        {"id": current_user.id},
        {
            "$set": {
                "onboarding_completed": True,
                "onboarding_step": None,  # Clear step since onboarding is done
                "provider_status": "submitted",  # Auto-advance to submitted status
                "updated_at": datetime.utcnow()
            }
        }
    )

    logger.info(f"User {current_user.id} ({current_user.role}) completed full onboarding")

    return {
        "success": True,
        "message": "Onboarding complete! Welcome to The Real Johnson.",
        "provider_status": "submitted"
    }


@api_router.post("/customers/verify-location")
async def verify_customer_location(
    verification_data: dict = Body(...),
    current_user: User = Depends(get_current_user_dependency)
):
    """
    Verify customer location against their profile address.

    Compares device GPS coordinates to address coordinates.
    Updates verification status: "verified", "unverified", or "mismatch".

    Required: device_lat, device_lon
    """
    # Only customers can verify their location
    if current_user.role != UserRole.CUSTOMER:
        raise HTTPException(
            status_code=403,
            detail="Only customers can verify location"
        )

    device_lat = verification_data.get("device_lat")
    device_lon = verification_data.get("device_lon")

    if not device_lat or not device_lon:
        raise HTTPException(
            status_code=400,
            detail="device_lat and device_lon are required"
        )

    # Get user's default address
    user_doc = await db.users.find_one({"id": current_user.id})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")

    addresses = user_doc.get("addresses", [])
    default_address = next((addr for addr in addresses if addr.get("is_default")), None)

    # Determine verification status
    status_value = "unverified"

    if default_address:
        address_lat = default_address.get("latitude")
        address_lon = default_address.get("longitude")

        if address_lat and address_lon:
            # Calculate distance (simple Euclidean distance for now)
            # For production, use Haversine formula for accurate distance
            lat_diff = abs(float(device_lat) - float(address_lat))
            lon_diff = abs(float(device_lon) - float(address_lon))

            # ~0.01 degrees ≈ ~1km tolerance
            # Adjust threshold as needed
            TOLERANCE = 0.05  # ~5km tolerance

            if lat_diff <= TOLERANCE and lon_diff <= TOLERANCE:
                status_value = "verified"
            else:
                status_value = "mismatch"
        else:
            # Address has no coordinates - cannot verify
            status_value = "unverified"
    else:
        # No default address - cannot verify
        status_value = "unverified"

    # Create or update verification object
    verification = {
        "status": status_value,
        "device_lat": float(device_lat),
        "device_lon": float(device_lon),
        "verified_at": datetime.utcnow() if status_value == "verified" else None,
        "auto_verify_enabled": user_doc.get("verification", {}).get("auto_verify_enabled", True)
    }

    # Update user document
    await db.users.update_one(
        {"id": current_user.id},
        {"$set": {"verification": verification, "updated_at": datetime.utcnow()}}
    )

    return {
        "success": True,
        "verification": verification
    }


@api_router.patch("/customers/verification-preferences")
async def update_verification_preferences(
    preferences: dict = Body(...),
    current_user: User = Depends(get_current_user_dependency)
):
    """
    Update customer location verification preferences.

    Allows toggling auto_verify_enabled on/off.
    """
    # Only customers can update verification preferences
    if current_user.role != UserRole.CUSTOMER:
        raise HTTPException(
            status_code=403,
            detail="Only customers can update verification preferences"
        )

    auto_verify_enabled = preferences.get("auto_verify_enabled")

    if auto_verify_enabled is None:
        raise HTTPException(
            status_code=400,
            detail="auto_verify_enabled is required"
        )

    # Get existing verification or create default
    user_doc = await db.users.find_one({"id": current_user.id})
    if not user_doc:
        raise HTTPException(status_code=404, detail="User not found")

    verification = user_doc.get("verification", {
        "status": "unverified",
        "auto_verify_enabled": True
    })

    verification["auto_verify_enabled"] = bool(auto_verify_enabled)

    # Update user document
    await db.users.update_one(
        {"id": current_user.id},
        {"$set": {"verification": verification, "updated_at": datetime.utcnow()}}
    )

    return {
        "success": True,
        "verification": verification
    }


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
    service = Service(**service_data.model_dump())
    service.created_at = datetime.utcnow()
    service.updated_at = datetime.utcnow()

    await db.services.insert_one(service.model_dump())
    return service


# ==================== QUOTE ROUTES ====================
# >>> PHOTO_DEBUG_START (DEBUG ENDPOINT - DEVELOPMENT ONLY)
# @api_router.post("/photo")
# async def debug_photo(request: Request, file: UploadFile = File(...)):
#     sp = request.app.state.storage if hasattr(request.app.state, "storage") else None
#     if not sp:
#         raise HTTPException(500, "Storage provider not initialized")
#     data = await file.read()
#     logger.info(f"📸 /photo: name={file.filename}, bytes={len(data)}")
#     key = f"debug/{uuid.uuid4()}_{file.filename}"
#     url = await sp.upload_photo_bytes(data, key)
#     logger.info(f"✅ /photo uploaded: {url}")
#     return {"url": url, "key": key}
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
        # Log incoming request details
        logger.info(f"📥 Received upload request: customer_id={customer_id}")
        logger.info(f"📄 File object: filename={file.filename}, content_type={file.content_type}")
        
        # Validate it's an image
        if not file.content_type or not file.content_type.startswith('image/'):
            logger.warning(f"⚠️ Invalid content type: {file.content_type}")
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read the file data
        logger.info("📖 Reading file data...")
        file_data = await file.read()
        file_size = len(file_data)
        logger.info(f"📸 Photo upload: filename={file.filename}, content_type={file.content_type}, size={file_size} bytes")
        
        if file_size > 0:
            logger.info(f"📊 First 20 bytes (hex): {file_data[:20].hex()}")
        else:
            logger.error("⚠️ File data is completely EMPTY!")

        if file_size == 0:
            logger.error("⚠️ Empty file received - no data!")
            raise HTTPException(status_code=400, detail="Empty file received")

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
        # Validate address_id is provided and exists in addresses collection
        if not quote_request.address_id:
            raise HTTPException(status_code=400, detail="address_id is required")

        address = await get_address_by_id(quote_request.address_id)
        if not address:
            raise HTTPException(status_code=404, detail="Address not found")

        quote_id = str(uuid.uuid4())
        
        # Step 1: Use photo URLs from immediate upload (no re-upload needed)
        # Photos were already uploaded via /api/photos/upload endpoint
        photo_urls = quote_request.photos if quote_request.photos else []
        logger.info(f"Using {len(photo_urls)} pre-uploaded photo URLs")
        
        # Step 2: Get AI suggestion if enabled
        ai_suggestion = None
        ai_suggestion_dict = None
        if os.getenv("FEATURE_AI_QUOTE_ENABLED", "true").lower() == "true":
            try:
                logger.info(f"🤖 Requesting AI quote for: {quote_request.service_category}")
                logger.info(f"Description: {quote_request.description[:200]}")
                logger.info(f"Photos: {len(quote_request.photos)} uploaded")

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
                
                logger.info(f"✅ AI suggestion generated: ${ai_suggestion.base_price_suggestion:.2f} for {ai_suggestion.estimated_hours}hrs ({ai_suggestion.confidence:.0%} confidence)")
                logger.info(f"AI reasoning: {ai_suggestion.reasoning[:200]}")
            except Exception as e:
                logger.warning(f"❌ AI quote generation failed: {e}")
                logger.info("Using fallback pricing engine instead")

        # Step 3: Calculate pricing using AI suggestion or fallback to default
        if ai_suggestion:
            base_price = ai_suggestion.base_price_suggestion
            estimated_hours = ai_suggestion.estimated_hours
            logger.info(f"Using AI-generated pricing: ${base_price:.2f} ({estimated_hours}hrs)")
        else:
            base_price = pricing_engine.get_base_price(quote_request.service_category)
            estimated_hours = pricing_engine.estimate_hours(quote_request.service_category)
            logger.info(f"Using fallback pricing for {quote_request.service_category}: ${base_price:.2f} ({estimated_hours}hrs)")
        
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
            service_category=quote_request.service_category,
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
            status=QuoteStatus.SENT,  # Auto-send quote so customer can immediately accept
            sent_at=datetime.utcnow(),  # Set sent timestamp
        )
        
        # Save to database
        quote_dict = quote.model_dump()

        # Convert dates to ISO format for MongoDB
        quote_dict["created_at"] = quote_dict["created_at"].isoformat()
        quote_dict["updated_at"] = quote_dict["updated_at"].isoformat()
        if quote_dict.get("sent_at"):
            quote_dict["sent_at"] = quote_dict["sent_at"].isoformat()
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
            "message": "Job posted successfully! Your quote is ready to review and accept.",
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

    # If quote was accepted, create a job
    job_id = None
    if response.accept:
        try:
            # Create job from accepted quote
            job = Job(
                customer_id=current_user.id,
                quote_id=quote_id,
                service_category=quote["service_category"],
                description=quote["description"],
                address_id=quote["address_id"],
                agreed_amount=quote["total_amount"],
                customer_notes=response.customer_notes,
            )

            # Attempt contractor routing
            try:
                contractor_id = await contractor_router.find_best_contractor(
                    service_category=quote["service_category"],
                    customer_address_id=quote["address_id"],
                    customer_id=current_user.id,
                    job_id=job.id
                )

                if contractor_id:
                    job.contractor_id = contractor_id
                    job.status = JobStatus.SCHEDULED
                    logger.info(f"Job {job.id} auto-assigned to contractor {contractor_id}")
                    # TODO: Send email to contractor about new job
                else:
                    logger.info(f"Job {job.id} created, awaiting manual routing")
                    # TODO: Send email to admin for manual assignment

            except Exception as e:
                logger.error(f"Contractor routing failed for job {job.id}: {e}")
                # Continue with job creation even if routing fails

            # Save job to database
            job_doc = job.model_dump()
            job_doc["created_at"] = job_doc["created_at"].isoformat()
            job_doc["updated_at"] = job_doc["updated_at"].isoformat()
            if job_doc.get("scheduled_date"):
                job_doc["scheduled_date"] = job_doc["scheduled_date"].isoformat()
            if job_doc.get("completed_at"):
                job_doc["completed_at"] = job_doc["completed_at"].isoformat()

            await db.jobs.insert_one(job_doc)
            job_id = job.id

            logger.info(f"Job {job_id} created from accepted quote {quote_id}")
            # TODO: Send email to customer confirming job creation

        except Exception as e:
            logger.error(f"Failed to create job from quote {quote_id}: {e}")
            # Don't fail the quote acceptance if job creation fails
            # Admin can manually create job later

    return {
        "message": f"Quote {new_status}",
        "quote_id": quote_id,
        "job_id": job_id if response.accept else None
    }


@api_router.delete("/quotes/{quote_id}")
async def delete_quote(
    quote_id: str,
    current_user: User = Depends(get_current_user_dependency),
):
    """
    Delete a quote request.

    Only the customer who created the quote can delete it.
    Performs a soft delete by setting status to 'cancelled'.
    """
    # Find quote and verify ownership
    quote = await db.quotes.find_one({"id": quote_id})
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")

    if quote["customer_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this quote")

    # Soft delete - set status to cancelled instead of actually deleting
    result = await db.quotes.update_one(
        {"id": quote_id},
        {
            "$set": {
                "status": "cancelled",
                "updated_at": datetime.utcnow().isoformat()
            }
        }
    )

    if result.modified_count > 0:
        logger.info(f"Quote {quote_id} cancelled by customer {current_user.id}")
        return {"message": "Quote deleted successfully", "quote_id": quote_id}
    else:
        raise HTTPException(status_code=500, detail="Failed to delete quote")


@api_router.post("/quotes/{quote_id}/contact")
async def contact_about_quote(
    quote_id: str,
    request_body: dict = None,
    current_user: User = Depends(get_current_user_dependency),
):
    """
    Send a message to admin/owner about a specific quote.

    Sends an email to the business owner with quote details and customer message.
    """
    # Find quote and verify ownership
    quote = await db.quotes.find_one({"id": quote_id})
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")

    if quote["customer_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Get customer message if provided
    message = request_body.get("message", "") if request_body else ""

    # Send email to admin/owner
    if email_provider:
        try:
            owner_email = ADMIN_EMAIL
            subject = f"Customer Contact Request - Quote #{quote_id[-8:]}"

            body = f"""
            <h2>Customer Contact Request</h2>
            <p>A customer has requested to contact you about their quote.</p>

            <h3>Customer Information:</h3>
            <ul>
                <li><strong>Name:</strong> {current_user.first_name} {current_user.last_name}</li>
                <li><strong>Email:</strong> {current_user.email}</li>
                <li><strong>Phone:</strong> {current_user.phone}</li>
            </ul>

            <h3>Quote Details:</h3>
            <ul>
                <li><strong>Quote ID:</strong> {quote_id}</li>
                <li><strong>Service:</strong> {quote.get('service_category', 'N/A')}</li>
                <li><strong>Status:</strong> {quote.get('status', 'N/A')}</li>
                <li><strong>Total:</strong> ${quote.get('total_amount', 0)}</li>
            </ul>

            {f'<h3>Customer Message:</h3><p>{message}</p>' if message else ''}

            <p><strong>Action Required:</strong> Please follow up with the customer within 24 hours.</p>
            """

            await email_provider.send_email(
                to_email=owner_email,
                subject=subject,
                html_body=body,
                from_email="noreply@therealjohnson.com",
                from_name="The Real Johnson - Customer Contact"
            )

            logger.info(f"Contact email sent for quote {quote_id} from customer {current_user.id}")
        except Exception as e:
            logger.error(f"Failed to send contact email: {e}")
            # Don't fail the request if email fails

    return {
        "message": "Your message has been sent. We'll follow up within 24 hours.",
        "quote_id": quote_id
    }


@api_router.post("/quotes/{quote_id}/report-issue")
async def report_contractor_issue(
    quote_id: str,
    request_body: dict,
    current_user: User = Depends(get_current_user_dependency),
):
    """
    Report an issue with a contractor for a specific quote.

    Logs the issue and sends an urgent email to admin/owner.
    """
    # Find quote and verify ownership
    quote = await db.quotes.find_one({"id": quote_id})
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")

    if quote["customer_id"] != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Get issue details
    issue_type = request_body.get("issue_type", "Other issue")
    details = request_body.get("details", "")

    # Log issue to database (create issues collection)
    issue_id = str(uuid.uuid4())
    issue_doc = {
        "id": issue_id,
        "quote_id": quote_id,
        "customer_id": current_user.id,
        "issue_type": issue_type,
        "details": details,
        "status": "reported",
        "created_at": datetime.utcnow().isoformat(),
        "resolved_at": None,
        "resolution_notes": None
    }

    await db.issues.insert_one(issue_doc)
    logger.warning(f"Issue reported for quote {quote_id}: {issue_type}")

    # Send urgent email to admin/owner
    if email_provider:
        try:
            owner_email = ADMIN_EMAIL
            subject = f"🚨 URGENT: Contractor Issue Reported - Quote #{quote_id[-8:]}"

            body = f"""
            <div style="background-color: #fff3cd; padding: 20px; border-left: 4px solid #ffc107;">
                <h2 style="color: #856404;">⚠️ Contractor Issue Reported</h2>
                <p style="color: #856404;"><strong>A customer has reported an issue that requires immediate attention.</strong></p>
            </div>

            <h3>Issue Details:</h3>
            <ul>
                <li><strong>Issue Type:</strong> {issue_type}</li>
                <li><strong>Issue ID:</strong> {issue_id}</li>
                {f'<li><strong>Details:</strong> {details}</li>' if details else ''}
            </ul>

            <h3>Customer Information:</h3>
            <ul>
                <li><strong>Name:</strong> {current_user.first_name} {current_user.last_name}</li>
                <li><strong>Email:</strong> {current_user.email}</li>
                <li><strong>Phone:</strong> {current_user.phone}</li>
            </ul>

            <h3>Quote Details:</h3>
            <ul>
                <li><strong>Quote ID:</strong> {quote_id}</li>
                <li><strong>Service:</strong> {quote.get('service_category', 'N/A')}</li>
                <li><strong>Status:</strong> {quote.get('status', 'N/A')}</li>
            </ul>

            <div style="background-color: #f8d7da; padding: 15px; margin-top: 20px; border-left: 4px solid #dc3545;">
                <p style="color: #721c24; margin: 0;"><strong>Action Required:</strong> Contact the customer immediately to resolve this issue.</p>
            </div>
            """

            await email_provider.send_email(
                to_email=owner_email,
                subject=subject,
                html_body=body,
                from_email="noreply@therealjohnson.com",
                from_name="The Real Johnson - Issue Alert"
            )

            logger.info(f"Issue alert email sent for quote {quote_id}")
        except Exception as e:
            logger.error(f"Failed to send issue alert email: {e}")
            # Don't fail the request if email fails

    return {
        "message": "Issue reported successfully. We'll contact you immediately.",
        "issue_id": issue_id,
        "quote_id": quote_id
    }


# ==================== JOB ROUTES ====================


@api_router.post("/jobs", response_model=JobCreateResponse)
async def create_job(
    job_data: JobCreateRequest,
    current_user: User = Depends(get_current_user_dependency)
):
    """
    Create a job request directly (no quote required).

    This endpoint:
    1. Validates request data
    2. Calculates estimated_total using pricing engine
    3. Creates job record with status from request (draft or published)
    4. Sends notifications (email + SMS to homeowner, email to admin)
    5. Returns job_id, status, estimated_total, created_at
    """
    # PHASE 3: Location verification gate for customers
    if current_user.role == UserRole.CUSTOMER:
        user_doc = await db.users.find_one({"id": current_user.id})
        verification = user_doc.get("verification") if user_doc else None

        if not verification or verification.get("status") != "verified":
            raise HTTPException(
                status_code=400,
                detail="location_not_verified"
            )

    # Get service for pricing calculation
    service = await db.services.find_one({"category": job_data.service_category})
    if not service:
        # Use default pricing if service not found
        estimated_total = job_data.budget_max if job_data.budget_max else 150.0
    else:
        # Calculate estimate using pricing engine
        from services.pricing_engine import PricingEngine
        from models.service import Service

        service_obj = Service(**service)
        engine = PricingEngine()
        pricing = engine.calculate_service_price(service_obj, quantity=1.0)
        estimated_total = pricing["base_price"]

        # Adjust based on urgency
        if job_data.urgency == "urgent" or job_data.urgency == "high":
            estimated_total *= 1.25  # 25% urgency surcharge

        # Cap at budget_max if provided
        if job_data.budget_max and estimated_total > job_data.budget_max:
            estimated_total = job_data.budget_max

    # Unified address logic: use canonical address_id or create from embedded address
    address_id = getattr(job_data, "address_id", None)

    if address_id:
        # Validate canonical address exists
        address = await get_address_by_id(address_id)
        if not address:
            raise HTTPException(status_code=404, detail="Address not found")
    else:
        # Fallback: if embedded address present but no id, create canonical address
        if getattr(job_data, "address", None):
            created = create_address_for_user(
                user_id=current_user.id,
                address_data={
                    "street": job_data.address.street,
                    "city": job_data.address.city,
                    "state": job_data.address.state,
                    "zip_code": job_data.address.zip,
                    "latitude": getattr(job_data.address, "lat", None),
                    "longitude": getattr(job_data.address, "lon", None),
                    "is_default": True,
                },
            )
            # Insert into addresses collection
            await db.addresses.insert_one(created.model_dump())
            address = created
            address_id = created.id
        else:
            raise HTTPException(status_code=400, detail="Address info required")

    # Create job with embedded address (backward compatibility)
    job = Job(
        customer_id=current_user.id,
        service_category=job_data.service_category,
        description=job_data.description,
        photos=job_data.photos,
        address=job_data.address,  # Use embedded address object
        budget_max=job_data.budget_max,
        urgency=job_data.urgency,
        preferred_timing=job_data.preferred_timing,
        contractor_type_preference=job_data.contractor_type_preference,
        status=job_data.status,  # Use status from request (draft or published)
    )

    # Save job to MongoDB
    job_doc = job.model_dump()

    # Add canonical address_id and snapshot
    job_doc["address_id"] = address_id
    job_doc["address_snapshot"] = address.model_dump()
    job_doc["created_at"] = job_doc["created_at"].isoformat()
    job_doc["updated_at"] = job_doc["updated_at"].isoformat()
    if job_doc.get("scheduled_date"):
        job_doc["scheduled_date"] = job_doc["scheduled_date"].isoformat()
    if job_doc.get("completed_date"):
        job_doc["completed_date"] = job_doc["completed_date"].isoformat()

    await db.jobs.insert_one(job_doc)

    logger.info(f"Job {job.id} created by customer {current_user.id} - {job_data.service_category}")

    # TODO: Send notifications
    # - Email to homeowner: "Job request #{job.id} received"
    # - SMS to homeowner: "We got your request for [category]. Est: $X-$Y"
    # - Email to admin: Full job details for manual assignment

    # Return response
    return JobCreateResponse(
        job_id=job.id,
        status=job.status,
        estimated_total=estimated_total,
        created_at=job.created_at.isoformat()
    )


@api_router.get("/jobs/{job_id}", response_model=Job)
async def get_job(
    job_id: str,
    current_user: User = Depends(get_current_user_dependency)
):
    """Get job by ID"""
    job = await db.jobs.find_one({"id": job_id})
    if not job:
        raise HTTPException(404, detail="Job not found")

    # Check authorization
    if (current_user.role == UserRole.CUSTOMER and job["customer_id"] != current_user.id) or \
       (current_user.role == UserRole.CONTRACTOR and job.get("contractor_id") != current_user.id):
        raise HTTPException(403, detail="Not authorized to view this job")

    return Job(**job)


@api_router.get("/jobs", response_model=List[Job])
async def list_jobs(
    status: Optional[str] = None,
    current_user: User = Depends(get_current_user_dependency)
):
    """List jobs for current user"""
    query = {}

    # Filter by user role
    if current_user.role == UserRole.CUSTOMER:
        query["customer_id"] = current_user.id
    elif current_user.role == UserRole.CONTRACTOR:
        query["contractor_id"] = current_user.id
    # Admins see all jobs

    # Filter by status if provided
    if status:
        query["status"] = status

    jobs = []
    async for job in db.jobs.find(query).sort("created_at", -1):
        jobs.append(Job(**job))

    return jobs


@api_router.get("/jobs/{job_id}/quotes", response_model=List[Quote])
async def get_job_quotes(
    job_id: str,
    current_user: User = Depends(get_current_user_dependency)
):
    """Get all quotes associated with a job"""
    job = await db.jobs.find_one({"id": job_id})
    if not job:
        raise HTTPException(404, detail="Job not found")

    # Check authorization
    if current_user.role == UserRole.CUSTOMER and job["customer_id"] != current_user.id:
        raise HTTPException(403, detail="Not authorized")

    # Get the original quote
    quotes = []
    async for quote in db.quotes.find({"id": job["quote_id"]}):
        quotes.append(Quote(**quote))

    return quotes


@api_router.patch("/jobs/{job_id}", response_model=Job)
async def update_job(
    job_id: str,
    update_data: JobUpdate,
    current_user: User = Depends(get_current_user_dependency)
):
    """Update job (contractor or admin only)"""
    job = await db.jobs.find_one({"id": job_id})
    if not job:
        raise HTTPException(404, detail="Job not found")

    # Only contractor or admin can update
    if current_user.role == UserRole.CUSTOMER:
        raise HTTPException(403, detail="Customers cannot update jobs")

    if current_user.role == UserRole.CONTRACTOR and job.get("contractor_id") != current_user.id:
        raise HTTPException(403, detail="Not authorized to update this job")

    # Build update dict (only include non-None fields)
    update_dict = {}
    for field, value in update_data.model_dump(exclude_unset=True).items():
        if value is not None:
            update_dict[field] = value

    if update_dict:
        update_dict["updated_at"] = datetime.utcnow().isoformat()
        await db.jobs.update_one({"id": job_id}, {"$set": update_dict})

    # Get updated job
    updated_job = await db.jobs.find_one({"id": job_id})
    return Job(**updated_job)


@api_router.get("/contractor/dashboard/stats")
async def get_contractor_dashboard_stats(
    current_user: User = Depends(get_current_user_dependency)
):
    """
    Get dashboard statistics for contractor.

    Returns job counts, revenue, expenses, and mileage data.
    """
    # Only contractors can access this endpoint
    if current_user.role != UserRole.CONTRACTOR:
        raise HTTPException(403, detail="Only contractors can access dashboard stats")

    # Get current month start and end dates
    now = datetime.utcnow()
    month_start = datetime(now.year, now.month, 1)
    year_start = datetime(now.year, 1, 1)

    # Count available jobs (pending, within 50 miles, matching skills)
    # For simplicity, we'll count all pending jobs
    # The frontend can call /contractor/jobs/available for the exact count
    available_jobs_count = await db.jobs.count_documents({
        "$or": [
            {"contractor_id": None},
            {"contractor_id": {"$exists": False}}
        ],
        "status": "pending"
    })

    # Count accepted jobs (assigned to this contractor, not yet scheduled)
    accepted_jobs_count = await db.jobs.count_documents({
        "contractor_id": current_user.id,
        "status": {"$in": ["pending", "accepted"]}
    })

    # Count scheduled jobs (assigned to this contractor with scheduled date)
    scheduled_jobs_count = await db.jobs.count_documents({
        "contractor_id": current_user.id,
        "status": "scheduled"
    })

    # Count completed jobs this month
    completed_this_month = await db.jobs.count_documents({
        "contractor_id": current_user.id,
        "status": "completed",
        "completed_at": {"$gte": month_start.isoformat()}
    })

    # Count completed jobs year to date
    completed_year_to_date = await db.jobs.count_documents({
        "contractor_id": current_user.id,
        "status": "completed",
        "completed_at": {"$gte": year_start.isoformat()}
    })

    # Calculate revenue from completed jobs
    # This month
    revenue_pipeline_month = [
        {
            "$match": {
                "contractor_id": current_user.id,
                "status": "completed",
                "completed_at": {"$gte": month_start.isoformat()}
            }
        },
        {
            "$group": {
                "_id": None,
                "total": {"$sum": "$agreed_amount"}
            }
        }
    ]

    revenue_month_result = await db.jobs.aggregate(revenue_pipeline_month).to_list(1)
    revenue_this_month = revenue_month_result[0]["total"] if revenue_month_result else 0

    # Year to date
    revenue_pipeline_year = [
        {
            "$match": {
                "contractor_id": current_user.id,
                "status": "completed",
                "completed_at": {"$gte": year_start.isoformat()}
            }
        },
        {
            "$group": {
                "_id": None,
                "total": {"$sum": "$agreed_amount"}
            }
        }
    ]

    revenue_year_result = await db.jobs.aggregate(revenue_pipeline_year).to_list(1)
    revenue_year_to_date = revenue_year_result[0]["total"] if revenue_year_result else 0

    # Get expenses (if expenses collection exists)
    try:
        expenses_month = await db.expenses.aggregate([
            {"$match": {
                "contractor_id": current_user.id,
                "date": {"$gte": month_start.isoformat()}
            }},
            {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
        ]).to_list(1)
        expenses_this_month = expenses_month[0]["total"] if expenses_month else 0

        expenses_year = await db.expenses.aggregate([
            {"$match": {
                "contractor_id": current_user.id,
                "date": {"$gte": year_start.isoformat()}
            }},
            {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
        ]).to_list(1)
        expenses_year_to_date = expenses_year[0]["total"] if expenses_year else 0
    except Exception as e:
        logger.warning(f"Expenses collection not available: {e}")
        expenses_this_month = 0
        expenses_year_to_date = 0

    # Get mileage (if mileage collection exists)
    try:
        mileage_month = await db.mileage.aggregate([
            {"$match": {
                "contractor_id": current_user.id,
                "date": {"$gte": month_start.isoformat()}
            }},
            {"$group": {"_id": None, "total": {"$sum": "$miles"}}}
        ]).to_list(1)
        miles_this_month = mileage_month[0]["total"] if mileage_month else 0

        mileage_year = await db.mileage.aggregate([
            {"$match": {
                "contractor_id": current_user.id,
                "date": {"$gte": year_start.isoformat()}
            }},
            {"$group": {"_id": None, "total": {"$sum": "$miles"}}}
        ]).to_list(1)
        miles_year_to_date = mileage_year[0]["total"] if mileage_year else 0

        # All time mileage
        mileage_all = await db.mileage.aggregate([
            {"$match": {"contractor_id": current_user.id}},
            {"$group": {"_id": None, "total": {"$sum": "$miles"}}}
        ]).to_list(1)
        miles_all_time = mileage_all[0]["total"] if mileage_all else 0
    except Exception as e:
        logger.warning(f"Mileage collection not available: {e}")
        miles_this_month = 0
        miles_year_to_date = 0
        miles_all_time = 0

    # Calculate profit
    profit_this_month = revenue_this_month - expenses_this_month
    profit_year_to_date = revenue_year_to_date - expenses_year_to_date

    stats = {
        "availableJobsCount": available_jobs_count,
        "acceptedJobsCount": accepted_jobs_count,
        "scheduledJobsCount": scheduled_jobs_count,
        "completedThisMonth": completed_this_month,
        "completedYearToDate": completed_year_to_date,
        "revenueThisMonth": revenue_this_month,
        "revenueYearToDate": revenue_year_to_date,
        "expensesThisMonth": expenses_this_month,
        "expensesYearToDate": expenses_year_to_date,
        "profitThisMonth": profit_this_month,
        "profitYearToDate": profit_year_to_date,
        "milesThisMonth": miles_this_month,
        "milesYearToDate": miles_year_to_date,
        "milesAllTime": miles_all_time,
    }

    logger.info(f"Dashboard stats for contractor {current_user.id}: {stats}")
    return stats


@api_router.get("/contractor/jobs/available")
async def get_available_jobs(
    current_user: User = Depends(get_current_user_dependency)
):
    """
    Get available jobs within 50-mile radius for contractor.

    Returns pending/unassigned jobs that match contractor's skills
    and are within 50 miles of contractor's business address.
    """
    # Only contractors can access this endpoint
    if current_user.role != UserRole.CONTRACTOR:
        raise HTTPException(403, detail="Only contractors can access available jobs")

    # Get contractor's business address
    if not current_user.addresses:
        raise HTTPException(400, detail="No business address on file. Please add an address.")

    business_address = next(
        (addr for addr in current_user.addresses if addr.is_default),
        current_user.addresses[0] if current_user.addresses else None
    )

    if not business_address:
        raise HTTPException(400, detail="No business address found")

    if not business_address.latitude or not business_address.longitude:
        raise HTTPException(
            400,
            detail="Business address not geocoded. Please update your address."
        )

    contractor_location = (business_address.latitude, business_address.longitude)
    MAX_DISTANCE_MILES = 50

    # Get all pending jobs (no contractor assigned)
    pending_jobs_cursor = db.jobs.find({
        "$or": [
            {"contractor_id": None},
            {"contractor_id": {"$exists": False}}
        ],
        "status": "pending"
    })

    from geopy.distance import geodesic

    available_jobs = []
    async for job_doc in pending_jobs_cursor:
        # Get customer address for this job
        customer = await db.users.find_one({"id": job_doc["customer_id"]})
        if not customer or not customer.get("addresses"):
            continue

        job_address = next(
            (addr for addr in customer["addresses"] if addr["id"] == job_doc["address_id"]),
            None
        )

        if not job_address or not job_address.get("latitude") or not job_address.get("longitude"):
            continue

        # Calculate distance
        job_location = (job_address["latitude"], job_address["longitude"])
        distance = geodesic(contractor_location, job_location).miles

        # Only include jobs within 50-mile radius
        if distance <= MAX_DISTANCE_MILES:
            # Check if contractor has matching skill
            service_category = job_doc.get("service_category", "")
            if service_category in current_user.skills:
                job_doc["distance_miles"] = round(distance, 2)
                job_doc["customer_address"] = {
                    "city": job_address.get("city", ""),
                    "state": job_address.get("state", ""),
                    "zip_code": job_address.get("zip_code", "")
                }
                available_jobs.append(job_doc)

    # Sort by distance (closest first)
    available_jobs.sort(key=lambda x: x["distance_miles"])

    logger.info(
        f"Contractor {current_user.id} found {len(available_jobs)} "
        f"available jobs within {MAX_DISTANCE_MILES} miles"
    )

    return {
        "jobs": available_jobs,
        "count": len(available_jobs),
        "max_distance_miles": MAX_DISTANCE_MILES,
        "contractor_location": {
            "city": business_address.city,
            "state": business_address.state
        }
    }


# ==================== ADDRESS REPOSITORY HELPERS ====================


def create_address_for_user(user_id: str, address_data: dict) -> Address:
    """
    Create a canonical Address document in the addresses collection.
    Keeps compatibility with embedded user.addresses if needed.
    """
    address = Address(
        user_id=user_id,
        street=address_data.get("street", "").strip(),
        unit_number=address_data.get("unit_number") or None,
        city=address_data.get("city", "").strip(),
        state=address_data.get("state", "").strip(),
        zip_code=address_data.get("zip_code", "").strip(),
        is_default=address_data.get("is_default", False),
        latitude=address_data.get("latitude"),
        longitude=address_data.get("longitude"),
    )

    return address


async def get_address_by_id(address_id: str) -> Optional[Address]:
    """Get address by ID from addresses collection"""
    doc = await db.addresses.find_one({"id": address_id})
    if not doc:
        return None
    return Address(**doc)


async def list_addresses_for_user(user_id: str) -> list:
    """List all addresses for a user from addresses collection"""
    docs = await db.addresses.find({"user_id": user_id}).sort("created_at", 1).to_list(100)
    return [Address(**doc) for doc in docs]


async def set_default_address(user_id: str, address_id: str) -> None:
    """Set an address as default and unset all others"""
    # Unset all defaults
    await db.addresses.update_many(
        {"user_id": user_id},
        {"$set": {"is_default": False}}
    )
    # Set the chosen default
    await db.addresses.update_one(
        {"user_id": user_id, "id": address_id},
        {"$set": {"is_default": True, "updated_at": datetime.utcnow()}}
    )


# ==================== USER PROFILE ROUTES ====================

@api_router.post("/address/verify")
async def verify_address(address_data: dict):
    """
    Verify address using geocoding API
    Issue #37 fix - Address verification endpoint
    """
    try:
        # Extract address fields
        street = address_data.get("street")
        city = address_data.get("city")
        state = address_data.get("state")
        zip_code = address_data.get("zip_code")

        if not all([street, city, state, zip_code]):
            return {"success": False, "message": "Missing required address fields"}

        # Use maps provider if available
        if maps_provider:
            try:
                full_address = f"{street}, {city}, {state} {zip_code}"
                geocode_result = await maps_provider.geocode(full_address)

                if geocode_result and geocode_result.get("latitude") and geocode_result.get("longitude"):
                    return {
                        "success": True,
                        "message": "Address verified successfully",
                        "latitude": geocode_result["latitude"],
                        "longitude": geocode_result["longitude"]
                    }
                else:
                    return {
                        "success": False,
                        "message": "Address could not be verified. Please check your input."
                    }
            except Exception as e:
                logger.error(f"Address verification error: {e}")
                return {
                    "success": False,
                    "message": f"Verification service error: {str(e)}"
                }
        else:
            return {
                "success": False,
                "message": "Address verification service not configured"
            }
    except Exception as e:
        logger.error(f"Address verification failed: {e}")
        return {
            "success": False,
            "message": f"Verification failed: {str(e)}"
        }

@api_router.post("/profile/addresses")
async def add_address(
    address: AddressInput, current_user: User = Depends(get_current_user_dependency)
):
    """
    Add or update address in user profile.

    Now writes to BOTH:
    1. addresses collection (canonical source of truth)
    2. user.addresses array (backward compatibility)

    If address.is_default is True:
    - Updates the existing default address (prevents duplicates)
    - Unsets is_default on all other addresses

    If address.is_default is False:
    - Adds new address without affecting existing defaults
    """
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

    # Create address payload for canonical collection
    address_payload = {
        "street": address.street,
        "unit_number": getattr(address, "unit_number", None),
        "city": address.city,
        "state": address.state,
        "zip_code": address.zip_code,
        "is_default": address.is_default,
        "latitude": address.latitude,
        "longitude": address.longitude,
    }

    # Create canonical address in addresses collection
    new_address = create_address_for_user(current_user.id, address_payload)
    await db.addresses.insert_one(new_address.model_dump())

    # Set as default in addresses collection if needed
    if new_address.is_default:
        await set_default_address(current_user.id, new_address.id)

    # Also update embedded user.addresses for backward compatibility
    user = await db.users.find_one({"id": current_user.id})
    existing_addresses = user.get("addresses", [])

    if address.is_default:
        # Find existing default address
        existing_default = next(
            (addr for addr in existing_addresses if addr.get("is_default")),
            None
        )

        if existing_default:
            # UPDATE existing default address (replace it completely)
            logger.info(f"Updating existing default address for user {current_user.id}")
            # Use address_payload (not address) and add new_address.id for sync
            updated_address = address_payload.copy()
            updated_address["id"] = new_address.id
            await db.users.update_one(
                {"id": current_user.id, "addresses.is_default": True},
                {"$set": {
                    "addresses.$": updated_address  # Replace the matched address
                }}
            )
        else:
            # No default exists, add this as the first default
            logger.info(f"Adding first default address for user {current_user.id}")
            # Use address_payload and add new_address.id
            new_address_doc = address_payload.copy()
            new_address_doc["id"] = new_address.id
            await db.users.update_one(
                {"id": current_user.id},
                {"$push": {"addresses": new_address_doc}}
            )
    else:
        # Not a default address, just add it
        new_address_doc = address_payload.copy()
        new_address_doc["id"] = new_address.id
        await db.users.update_one(
            {"id": current_user.id},
            {"$push": {"addresses": new_address_doc}}
        )

    return {"message": "Address saved successfully", "address_id": new_address.id}


@api_router.get("/profile/addresses", response_model=List[Address])
async def get_addresses(current_user: User = Depends(get_current_user_dependency)):
    """
    Get user addresses from canonical addresses collection.
    Falls back to embedded addresses if collection is empty (for backward compatibility).
    """
    # Try to get from addresses collection first
    addresses = await list_addresses_for_user(current_user.id)

    # Fallback to embedded addresses if collection is empty
    if not addresses and current_user.addresses:
        logger.info(f"No addresses in collection for user {current_user.id}, using embedded addresses")
        return current_user.addresses

    return addresses


# ==================== CONTRACTOR PROFILE ROUTES ====================


@api_router.patch("/contractors/documents")
async def update_contractor_documents(
    documents: dict,
    current_user: User = Depends(get_current_user_dependency)
):
    """
    Update contractor documents (license, business licenses, insurance).

    Expected structure:
    {
        "license": "https://...",  # Driver's license (single URL)
        "business_license": ["https://...", "https://..."],  # Professional licenses (array)
        "insurance": "https://..."  # Insurance certificate (single URL)
    }
    """
    if current_user.role != UserRole.CONTRACTOR:
        raise HTTPException(403, detail="Only contractors can update documents")

    # Validate document URLs
    for key, value in documents.items():
        if value and not (isinstance(value, str) or isinstance(value, list)):
            raise HTTPException(400, detail=f"Invalid document format for {key}")

    # Update documents in database
    result = await db.users.update_one(
        {"id": current_user.id},
        {
            "$set": {
                "documents": documents,
                "updated_at": datetime.utcnow().isoformat()
            }
        }
    )

    if result.modified_count > 0:
        logger.info(f"Updated documents for contractor {current_user.id}")
        return {"message": "Documents updated successfully", "documents": documents}
    else:
        raise HTTPException(500, detail="Failed to update documents")


class PortfolioUpdate(BaseModel):
    portfolio_photos: List[str]


@api_router.patch("/contractors/portfolio")
async def update_contractor_portfolio(
    data: PortfolioUpdate,
    current_user: User = Depends(get_current_user_dependency)
):
    """
    Update contractor portfolio photos.

    Expected structure:
    {
        "portfolio_photos": ["https://...", "https://...", ...]
    }
    """
    if current_user.role != UserRole.CONTRACTOR:
        raise HTTPException(403, detail="Only contractors can update portfolio")

    # Validate photo URLs
    if not isinstance(data.portfolio_photos, list):
        raise HTTPException(400, detail="portfolio_photos must be an array")

    for url in data.portfolio_photos:
        if not isinstance(url, str) or not url.startswith("http"):
            raise HTTPException(400, detail="All portfolio photos must be valid URLs")

    # Update portfolio in database
    result = await db.users.update_one(
        {"id": current_user.id},
        {
            "$set": {
                "portfolio_photos": data.portfolio_photos,
                "updated_at": datetime.utcnow().isoformat()
            }
        }
    )

    if result.modified_count > 0:
        logger.info(f"Updated portfolio for contractor {current_user.id} ({len(data.portfolio_photos)} photos)")
        return {"message": "Portfolio updated successfully", "count": len(data.portfolio_photos)}
    else:
        raise HTTPException(500, detail="Failed to update portfolio")


@api_router.patch("/contractors/profile")
async def update_contractor_profile(
    profile_data: dict,
    current_user: User = Depends(get_current_user_dependency)
):
    """
    Update contractor/handyman profile (skills, experience, business info).

    Expected structure:
    {
        "skills": ["Drywall", "Painting", ...],
        "years_experience": 10,
        "business_name": "John's Handyman Services"
    }
    """
    if current_user.role not in [UserRole.CONTRACTOR, UserRole.HANDYMAN]:
        raise HTTPException(403, detail="Only contractors and handymen can update profile")

    # Build update dict with only provided fields
    update_fields = {}
    if "skills" in profile_data:
        update_fields["skills"] = profile_data["skills"]
    if "specialties" in profile_data:
        update_fields["specialties"] = profile_data["specialties"]
    if "years_experience" in profile_data:
        update_fields["years_experience"] = profile_data["years_experience"]
    if "business_name" in profile_data:
        update_fields["business_name"] = profile_data["business_name"]
    if "provider_intent" in profile_data:
        update_fields["provider_intent"] = profile_data["provider_intent"]

    # Handle business_address by adding to addresses array
    if "business_address" in profile_data:
        addr_data = profile_data["business_address"]
        new_address = {
            "id": str(uuid.uuid4()),
            "street": addr_data.get("street", ""),
            "city": addr_data.get("city", ""),
            "state": addr_data.get("state", ""),
            "zip_code": addr_data.get("zip", ""),
            "is_default": True
        }
        # Add address to addresses array (replace any existing default address)
        update_fields["addresses"] = [new_address]

    # Handle banking_info (for Stripe Connect or similar)
    if "banking_info" in profile_data:
        update_fields["banking_info"] = profile_data["banking_info"]

    if not update_fields:
        raise HTTPException(400, detail="No fields to update")

    update_fields["updated_at"] = datetime.utcnow().isoformat()

    # Update profile in database
    result = await db.users.update_one(
        {"id": current_user.id},
        {"$set": update_fields}
    )

    # Recompute provider_completeness and provider_status after update
    updated_user = await db.users.find_one({"id": current_user.id})
    if updated_user:
        # Compute new completeness
        completeness = compute_provider_completeness(updated_user)

        # Compute new status based on completeness and other factors
        new_status = compute_new_status(
            current_status=updated_user.get("provider_status", "draft"),
            completeness=completeness,
            address_verification_status=updated_user.get("address_verification_status", "pending"),
            address_verification_deadline=updated_user.get("address_verification_deadline")
        )

        # Update both completeness and status
        await db.users.update_one(
            {"id": current_user.id},
            {"$set": {
                "provider_completeness": completeness,
                "provider_status": new_status
            }}
        )

        # Log status transitions
        if new_status != updated_user.get("provider_status"):
            logger.info(f"Provider status transition for {current_user.id}: {updated_user.get('provider_status')} → {new_status}")

    if result.modified_count > 0:
        logger.info(f"Updated profile for contractor {current_user.id}: {list(update_fields.keys())}")
        return {"message": "Profile updated successfully", "updated_fields": list(update_fields.keys())}
    else:
        # No changes made (fields were same as before)
        return {"message": "No changes made", "updated_fields": []}



@api_router.post("/contractor/photos/document")
async def upload_contractor_document(
    file: UploadFile = File(...),
    document_type: str = Form(...),  # 'license', 'insurance', 'business_license'
    current_user: User = Depends(get_current_user_dependency)
):
    """
    Upload contractor document (license, insurance, business license)
    Saves to: contractors/{contractor_id}/profile/{document_type}_{filename}
    """
    if current_user.role != UserRole.CONTRACTOR:
        raise HTTPException(403, detail="Only contractors can upload documents")

    try:
        # Validate document type
        valid_types = ['license', 'insurance', 'business_license']
        if document_type not in valid_types:
            raise HTTPException(400, detail=f"Invalid document type. Must be one of: {valid_types}")

        # Validate it's an image
        if not file.content_type or not file.content_type.startswith('image/'):
            raise HTTPException(400, detail="File must be an image")

        # Read file data
        file_data = await file.read()
        if len(file_data) == 0:
            raise HTTPException(400, detail="Empty file received")

        # Generate filename
        file_extension = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
        filename = f"{uuid.uuid4().hex[:8]}.{file_extension}"

        # Upload to contractor-specific path
        url = await storage_provider.upload_contractor_document(
            file_data=file_data,
            contractor_id=current_user.id,
            document_type=document_type,
            filename=filename,
            content_type=file.content_type
        )

        logger.info(f"Contractor document uploaded: {document_type} for {current_user.id}")

        return {
            "success": True,
            "url": url,
            "document_type": document_type
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Upload error: {str(e)}")
        raise HTTPException(500, detail=f"Upload failed: {str(e)}")


@api_router.post("/contractor/photos/portfolio")
async def upload_contractor_portfolio_photo(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user_dependency)
):
    """
    Upload contractor portfolio photo
    Saves to: contractors/{contractor_id}/portfolio/{filename}
    """
    if current_user.role != UserRole.CONTRACTOR:
        raise HTTPException(403, detail="Only contractors can upload portfolio photos")

    try:
        # Validate it's an image
        if not file.content_type or not file.content_type.startswith('image/'):
            raise HTTPException(400, detail="File must be an image")

        # Read file data
        file_data = await file.read()
        if len(file_data) == 0:
            raise HTTPException(400, detail="Empty file received")

        # Generate filename
        file_extension = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
        filename = f"portfolio_{uuid.uuid4().hex[:8]}.{file_extension}"

        # Upload to contractor portfolio path
        url = await storage_provider.upload_contractor_portfolio(
            file_data=file_data,
            contractor_id=current_user.id,
            filename=filename,
            content_type=file.content_type
        )

        logger.info(f"Contractor portfolio photo uploaded for {current_user.id}")

        return {
            "success": True,
            "url": url
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Upload error: {str(e)}")
        raise HTTPException(500, detail=f"Upload failed: {str(e)}")


@api_router.post("/handyman/profile-photo/upload")
async def upload_handyman_profile_photo(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user_dependency)
):
    """
    Upload handyman profile photo
    Saves to: handymen/{handyman_id}/profile/profile_{uuid}.{ext}
    Updates user.profile_photo field in database
    """
    if current_user.role != UserRole.HANDYMAN:
        raise HTTPException(403, detail="Only handymen can upload profile photos to this endpoint")

    try:
        # Read file data
        file_data = await file.read()

        # Get file extension
        filename = file.filename or "profile.jpg"
        ext = filename.split(".")[-1].lower()

        # Validate file type
        allowed_extensions = ["jpg", "jpeg", "png", "gif", "webp"]
        if ext not in allowed_extensions:
            raise HTTPException(400, detail=f"Invalid file type. Allowed: {', '.join(allowed_extensions)}")

        # Upload to handyman profile path
        url = await storage_provider.upload_handyman_profile_photo(
            file_data=file_data,
            handyman_id=current_user.id,
            filename=filename,
            extension=ext
        )

        # Update user profile_photo field in database
        await db.users.update_one(
            {"id": current_user.id},
            {"$set": {"profile_photo": url, "updated_at": datetime.utcnow().isoformat()}}
        )

        return {"success": True, "url": url, "message": "Profile photo uploaded successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Profile photo upload error: {str(e)}")
        raise HTTPException(500, detail=f"Upload failed: {str(e)}")


@api_router.post("/contractor/profile-photo/upload")
async def upload_contractor_profile_photo(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user_dependency)
):
    """
    Upload contractor profile photo/logo
    Saves to: contractors/{contractor_id}/profile/profile_{uuid}.{ext}
    Updates user.profile_photo field in database
    """
    if current_user.role != UserRole.CONTRACTOR:
        raise HTTPException(403, detail="Only contractors can upload profile photos")

    try:
        # Validate it's an image
        if not file.content_type or not file.content_type.startswith('image/'):
            raise HTTPException(400, detail="File must be an image")

        # Read file data
        file_data = await file.read()
        if len(file_data) == 0:
            raise HTTPException(400, detail="Empty file received")

        # Generate filename
        file_extension = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
        filename = f"profile_{uuid.uuid4().hex[:8]}.{file_extension}"

        # Upload to contractor profile path
        url = await storage_provider.upload_contractor_profile_photo(
            file_data=file_data,
            contractor_id=current_user.id,
            filename=filename,
            content_type=file.content_type
        )

        # Update user profile_photo field in database
        await db.users.update_one(
            {"id": current_user.id},
            {"$set": {"profile_photo": url, "updated_at": datetime.utcnow().isoformat()}}
        )

        logger.info(f"Contractor profile photo uploaded for {current_user.id}")

        return {
            "success": True,
            "url": url,
            "message": "Profile photo uploaded successfully"
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Profile photo upload error: {str(e)}")
        raise HTTPException(500, detail=f"Upload failed: {str(e)}")



@api_router.post("/contractor/photos/job/{job_id}")
async def upload_contractor_job_photo(
    job_id: str,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user_dependency)
):
    """
    Upload contractor job photo (progress, completion, etc.)
    Saves to: contractors/{contractor_id}/jobs/{job_id}/{filename}
    """
    if current_user.role != UserRole.CONTRACTOR:
        raise HTTPException(403, detail="Only contractors can upload job photos")

    try:
        # Validate it's an image
        if not file.content_type or not file.content_type.startswith('image/'):
            raise HTTPException(400, detail="File must be an image")

        # Read file data
        file_data = await file.read()
        if len(file_data) == 0:
            raise HTTPException(400, detail="Empty file received")

        # Generate filename
        file_extension = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
        timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
        filename = f"{timestamp}_{uuid.uuid4().hex[:8]}.{file_extension}"

        # Upload to contractor job path
        url = await storage_provider.upload_contractor_job_photo(
            file_data=file_data,
            contractor_id=current_user.id,
            job_id=job_id,
            filename=filename,
            content_type=file.content_type
        )

        logger.info(f"Contractor job photo uploaded: job={job_id}, contractor={current_user.id}")

        return {
            "success": True,
            "url": url,
            "job_id": job_id
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Upload error: {str(e)}")
        raise HTTPException(500, detail=f"Upload failed: {str(e)}")



# ==================== CONTRACTOR EXPENSE ROUTES ====================


@api_router.get("/contractor/expenses")
async def get_contractor_expenses(
    job_id: Optional[str] = None,
    current_user: User = Depends(get_current_user_dependency)
):
    """Get all expenses for the contractor, optionally filtered by job_id."""
    if current_user.role != UserRole.CONTRACTOR:
        raise HTTPException(403, detail="Only contractors can access expenses")

    query = {"contractor_id": current_user.id}
    if job_id:
        query["job_id"] = job_id

    expenses = await db.expenses.find(query).sort("date", -1).to_list(100)

    # Remove MongoDB's _id field from all expenses to avoid serialization issues
    for expense in expenses:
        expense.pop('_id', None)

    return expenses


@api_router.post("/contractor/expenses")
async def create_expense(
    expense: dict = Body(...),
    current_user: User = Depends(get_current_user_dependency)
):
    """Create a new expense for the contractor."""
    if current_user.role != UserRole.CONTRACTOR:
        raise HTTPException(403, detail="Only contractors can create expenses")

    # Create expense document
    expense_doc = {
        "id": str(uuid.uuid4()),
        "contractor_id": current_user.id,
        "job_id": expense.get("jobId"),
        "category": expense.get("category"),
        "description": expense.get("description"),
        "amount": float(expense.get("amount", 0)),
        "date": expense.get("date", datetime.utcnow().isoformat()),
        "vendor": expense.get("vendor"),
        "notes": expense.get("notes"),
        "receipt_photos": expense.get("receiptPhotos", []),
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }

    await db.expenses.insert_one(expense_doc)
    logger.info(f"Expense created: {expense_doc['id']} for contractor {current_user.id}")

    # Remove MongoDB's _id field to avoid serialization issues
    expense_doc.pop('_id', None)
    return expense_doc


@api_router.delete("/contractor/expenses/{expense_id}")
async def delete_expense(
    expense_id: str,
    current_user: User = Depends(get_current_user_dependency)
):
    """Delete an expense."""
    if current_user.role != UserRole.CONTRACTOR:
        raise HTTPException(403, detail="Only contractors can delete expenses")

    result = await db.expenses.delete_one({
        "id": expense_id,
        "contractor_id": current_user.id
    })

    if result.deleted_count == 0:
        raise HTTPException(404, detail="Expense not found")

    return {"message": "Expense deleted successfully"}


@api_router.post("/contractor/expenses/{expense_id}/receipt")
async def upload_expense_receipt(
    expense_id: str,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user_dependency)
):
    """Upload receipt photo for an expense"""
    if current_user.role != UserRole.CONTRACTOR:
        raise HTTPException(403, detail="Only contractors can upload receipts")

    # Verify expense belongs to this contractor
    expense = await db.expenses.find_one({"id": expense_id, "contractor_id": current_user.id})
    if not expense:
        raise HTTPException(404, detail="Expense not found")

    try:
        # Validate it's an image
        if not file.content_type or not file.content_type.startswith('image/'):
            raise HTTPException(400, detail="File must be an image")

        # Read file data
        file_data = await file.read()
        if len(file_data) == 0:
            raise HTTPException(400, detail="Empty file received")

        # Generate filename
        file_extension = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
        filename = f"receipt_{uuid.uuid4().hex[:8]}.{file_extension}"

        # Upload to storage (reuse contractor job photo path)
        url = await storage_provider.upload_contractor_job_photo(
            file_data=file_data,
            contractor_id=current_user.id,
            job_id=expense.get('job_id', 'expenses'),
            filename=filename,
            content_type=file.content_type
        )

        # Add receipt URL to expense
        receipt_photos = expense.get('receipt_photos', [])
        receipt_photos.append(url)

        await db.expenses.update_one(
            {"id": expense_id},
            {"$set": {"receipt_photos": receipt_photos, "updated_at": datetime.utcnow().isoformat()}}
        )

        logger.info(f"Receipt uploaded for expense {expense_id}")
        return {"success": True, "url": url}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Receipt upload error: {str(e)}")
        raise HTTPException(500, detail=f"Upload failed: {str(e)}")


# ==================== CONTRACTOR JOB ROUTES (LICENSED) ====================


@api_router.get("/contractor/jobs/accepted")
async def get_accepted_contractor_jobs(
    current_user: User = Depends(get_current_user_dependency)
):
    """Get jobs accepted by this contractor"""
    if current_user.role != UserRole.CONTRACTOR:
        raise HTTPException(403, detail="Only contractors can access this endpoint")

    jobs = await db.jobs.find({
        "contractor_id": current_user.id,
        "status": {"$in": ["accepted", "quoted"]}
    }).sort("created_at", -1).to_list(100)

    for job in jobs:
        job.pop('_id', None)
    return jobs


@api_router.get("/contractor/jobs/scheduled")
async def get_scheduled_contractor_jobs(
    current_user: User = Depends(get_current_user_dependency)
):
    """Get scheduled jobs for this contractor"""
    if current_user.role != UserRole.CONTRACTOR:
        raise HTTPException(403, detail="Only contractors can access this endpoint")

    jobs = await db.jobs.find({
        "contractor_id": current_user.id,
        "status": "scheduled"
    }).sort("scheduled_date", 1).to_list(100)

    for job in jobs:
        job.pop('_id', None)
    return jobs


@api_router.get("/contractor/jobs/completed")
async def get_completed_contractor_jobs(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    current_user: User = Depends(get_current_user_dependency)
):
    """Get completed jobs for this contractor"""
    if current_user.role != UserRole.CONTRACTOR:
        raise HTTPException(403, detail="Only contractors can access this endpoint")

    query = {
        "contractor_id": current_user.id,
        "status": "completed"
    }

    if start_date and end_date:
        query["completed_at"] = {"$gte": start_date, "$lte": end_date}

    jobs = await db.jobs.find(query).sort("completed_at", -1).to_list(100)

    for job in jobs:
        job.pop('_id', None)
    return jobs


@api_router.get("/contractor/jobs/{job_id}")
async def get_contractor_job(
    job_id: str,
    current_user: User = Depends(get_current_user_dependency)
):
    """Get specific job details for contractor"""
    if current_user.role != UserRole.CONTRACTOR:
        raise HTTPException(403, detail="Only contractors can access this endpoint")

    job = await db.jobs.find_one({"id": job_id, "contractor_id": current_user.id})
    if not job:
        raise HTTPException(404, detail="Job not found or not assigned to you")

    job.pop('_id', None)
    return job


@api_router.post("/contractor/jobs/{job_id}/accept")
async def accept_contractor_job(
    job_id: str,
    current_user: User = Depends(get_current_user_dependency)
):
    """Accept/claim a job"""
    if current_user.role != UserRole.CONTRACTOR:
        raise HTTPException(403, detail="Only contractors can accept jobs")

    # Check provider_status - only active providers can accept jobs
    if current_user.provider_status != "active":
        raise HTTPException(
            403,
            detail={
                "error": "Provider not active",
                "provider_status": current_user.provider_status,
                "message": "You must complete your profile and verification to accept jobs"
            }
        )

    # Find the job
    job = await db.jobs.find_one({"id": job_id})
    if not job:
        raise HTTPException(404, detail="Job not found")

    # Check if already assigned
    if job.get('contractor_id'):
        raise HTTPException(400, detail="Job already assigned to another contractor")

    # Assign job to contractor
    await db.jobs.update_one(
        {"id": job_id},
        {"$set": {
            "contractor_id": current_user.id,
            "status": "accepted",
            "accepted_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }}
    )

    logger.info(f"Job {job_id} accepted by contractor {current_user.id}")

    # Return updated job
    updated_job = await db.jobs.find_one({"id": job_id})
    updated_job.pop('_id', None)
    return updated_job


@api_router.patch("/contractor/jobs/{job_id}/status")
async def update_contractor_job_status(
    job_id: str,
    status_update: dict = Body(...),
    current_user: User = Depends(get_current_user_dependency)
):
    """Update job status"""
    if current_user.role != UserRole.CONTRACTOR:
        raise HTTPException(403, detail="Only contractors can update job status")

    # Verify job belongs to this contractor
    job = await db.jobs.find_one({"id": job_id, "contractor_id": current_user.id})
    if not job:
        raise HTTPException(404, detail="Job not found or not assigned to you")

    new_status = status_update.get('status')
    valid_statuses = ['accepted', 'scheduled', 'in_progress', 'completed', 'cancelled']

    if new_status not in valid_statuses:
        raise HTTPException(400, detail=f"Invalid status. Must be one of: {valid_statuses}")

    update_data = {
        "status": new_status,
        "updated_at": datetime.utcnow().isoformat()
    }

    # Add completion timestamp if completing
    if new_status == 'completed':
        update_data["completed_at"] = datetime.utcnow().isoformat()

    await db.jobs.update_one(
        {"id": job_id},
        {"$set": update_data}
    )

    logger.info(f"Job {job_id} status updated to {new_status}")

    # Return updated job
    updated_job = await db.jobs.find_one({"id": job_id})
    updated_job.pop('_id', None)
    return updated_job


# ==================== CONTRACTOR JOB PHOTOS ====================


@api_router.post("/contractor/jobs/{job_id}/photos")
async def create_contractor_job_photo(
    job_id: str,
    file: UploadFile = File(...),
    category: str = Form('progress'),  # 'before', 'progress', 'after', 'issue'
    caption: Optional[str] = Form(None),
    notes: Optional[str] = Form(None),
    current_user: User = Depends(get_current_user_dependency)
):
    """Upload a photo for a job with metadata"""
    if current_user.role != UserRole.CONTRACTOR:
        raise HTTPException(403, detail="Only contractors can upload job photos")

    # Verify job belongs to this contractor
    job = await db.jobs.find_one({"id": job_id, "contractor_id": current_user.id})
    if not job:
        raise HTTPException(404, detail="Job not found or not assigned to you")

    try:
        # Validate image
        if not file.content_type or not file.content_type.startswith('image/'):
            raise HTTPException(400, detail="File must be an image")

        file_data = await file.read()
        if len(file_data) == 0:
            raise HTTPException(400, detail="Empty file received")

        # Generate filename
        file_extension = file.filename.split('.')[-1] if '.' in file.filename else 'jpg'
        timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
        filename = f"{category}_{timestamp}_{uuid.uuid4().hex[:8]}.{file_extension}"

        # Upload to storage
        url = await storage_provider.upload_contractor_job_photo(
            file_data=file_data,
            contractor_id=current_user.id,
            job_id=job_id,
            filename=filename,
            content_type=file.content_type
        )

        # Save photo metadata
        photo_doc = {
            "id": str(uuid.uuid4()),
            "contractor_id": current_user.id,
            "job_id": job_id,
            "url": url,
            "category": category,
            "caption": caption,
            "notes": notes,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }

        await db.job_photos.insert_one(photo_doc)
        logger.info(f"Job photo uploaded: job={job_id}, category={category}")

        photo_doc.pop('_id', None)
        return photo_doc

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Job photo upload error: {str(e)}")
        raise HTTPException(500, detail=f"Upload failed: {str(e)}")


@api_router.get("/contractor/jobs/{job_id}/photos")
async def get_contractor_job_photos(
    job_id: str,
    category: Optional[str] = None,
    current_user: User = Depends(get_current_user_dependency)
):
    """Get photos for a job"""
    if current_user.role != UserRole.CONTRACTOR:
        raise HTTPException(403, detail="Only contractors can access job photos")

    # Verify job belongs to this contractor
    job = await db.jobs.find_one({"id": job_id, "contractor_id": current_user.id})
    if not job:
        raise HTTPException(404, detail="Job not found or not assigned to you")

    query = {"job_id": job_id, "contractor_id": current_user.id}
    if category:
        query["category"] = category

    photos = await db.job_photos.find(query).sort("created_at", -1).to_list(100)

    for photo in photos:
        photo.pop('_id', None)
    return photos


@api_router.delete("/contractor/jobs/{job_id}/photos/{photo_id}")
async def delete_contractor_job_photo(
    job_id: str,
    photo_id: str,
    current_user: User = Depends(get_current_user_dependency)
):
    """Delete a job photo"""
    if current_user.role != UserRole.CONTRACTOR:
        raise HTTPException(403, detail="Only contractors can delete job photos")

    result = await db.job_photos.delete_one({
        "id": photo_id,
        "job_id": job_id,
        "contractor_id": current_user.id
    })

    if result.deleted_count == 0:
        raise HTTPException(404, detail="Photo not found")

    return {"message": "Photo deleted successfully"}


@api_router.put("/contractor/jobs/{job_id}/photos/{photo_id}")
async def update_contractor_job_photo(
    job_id: str,
    photo_id: str,
    update_data: JobPhotoUpdateRequest,
    current_user: User = Depends(get_current_user_dependency)
):
    """Update photo caption/notes"""
    if current_user.role != UserRole.CONTRACTOR:
        raise HTTPException(403, detail="Only contractors can update job photos")

    # Verify photo exists and belongs to this contractor
    photo = await db.job_photos.find_one({
        "id": photo_id,
        "job_id": job_id,
        "contractor_id": current_user.id
    })

    if not photo:
        raise HTTPException(404, detail="Photo not found")

    update_fields = {"updated_at": datetime.utcnow().isoformat()}
    if update_data.caption is not None:
        update_fields["caption"] = update_data.caption
    if update_data.notes is not None:
        update_fields["notes"] = update_data.notes

    await db.job_photos.update_one(
        {"id": photo_id},
        {"$set": update_fields}
    )

    updated_photo = await db.job_photos.find_one({"id": photo_id})
    updated_photo.pop('_id', None)
    return updated_photo


# ==================== CONTRACTOR MILEAGE ROUTES ====================


@api_router.get("/contractor/mileage")
async def get_contractor_mileage_logs(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    job_id: Optional[str] = None,
    current_user: User = Depends(get_current_user_dependency)
):
    """Get mileage logs for contractor"""
    if current_user.role != UserRole.CONTRACTOR:
        raise HTTPException(403, detail="Only contractors can access mileage logs")

    query = {"contractor_id": current_user.id}

    if job_id:
        query["job_id"] = job_id

    if start_date and end_date:
        query["date"] = {"$gte": start_date, "$lte": end_date}

    logs = await db.mileage_logs.find(query).sort("date", -1).to_list(100)

    for log in logs:
        log.pop('_id', None)
    return logs


@api_router.post("/contractor/mileage")
async def create_mileage_log(
    log_data: MileageCreateRequest,
    current_user: User = Depends(get_current_user_dependency)
):
    """Create a new mileage log"""
    if current_user.role != UserRole.CONTRACTOR:
        raise HTTPException(403, detail="Only contractors can create mileage logs")

    log_doc = {
        "id": str(uuid.uuid4()),
        "contractor_id": current_user.id,
        "job_id": log_data.job_id,
        "date": log_data.date,
        "start_location": log_data.start_location.model_dump(),
        "end_location": log_data.end_location.model_dump(),
        "miles": log_data.miles,
        "purpose": log_data.purpose,
        "notes": log_data.notes,
        "auto_tracked": log_data.auto_tracked,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }

    await db.mileage_logs.insert_one(log_doc)
    logger.info(f"Mileage log created: {log_doc['id']} for contractor {current_user.id}")

    log_doc.pop('_id', None)
    return log_doc


@api_router.delete("/contractor/mileage/{mileage_id}")
async def delete_mileage_log(
    mileage_id: str,
    current_user: User = Depends(get_current_user_dependency)
):
    """Delete a mileage log"""
    if current_user.role != UserRole.CONTRACTOR:
        raise HTTPException(403, detail="Only contractors can delete mileage logs")

    result = await db.mileage_logs.delete_one({
        "id": mileage_id,
        "contractor_id": current_user.id
    })

    if result.deleted_count == 0:
        raise HTTPException(404, detail="Mileage log not found")

    return {"message": "Mileage log deleted successfully"}


# ==================== CONTRACTOR TIME LOG ROUTES ====================


@api_router.post("/contractor/jobs/{job_id}/time/start")
async def start_time_log(
    job_id: str,
    request_data: TimeLogStartRequest,
    current_user: User = Depends(get_current_user_dependency)
):
    """Start time tracking for a job"""
    if current_user.role != UserRole.CONTRACTOR:
        raise HTTPException(403, detail="Only contractors can start time logs")

    # Verify job belongs to this contractor
    job = await db.jobs.find_one({"id": job_id, "contractor_id": current_user.id})
    if not job:
        raise HTTPException(404, detail="Job not found or not assigned to you")

    # Check for existing active time log
    active_log = await db.time_logs.find_one({
        "contractor_id": current_user.id,
        "job_id": job_id,
        "end_time": None
    })

    if active_log:
        raise HTTPException(400, detail="Time log already active for this job")

    time_log = {
        "id": str(uuid.uuid4()),
        "contractor_id": current_user.id,
        "job_id": job_id,
        "start_time": datetime.utcnow().isoformat(),
        "end_time": None,
        "duration_minutes": None,
        "notes": request_data.notes,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }

    await db.time_logs.insert_one(time_log)
    logger.info(f"Time log started: {time_log['id']} for job {job_id}")

    time_log.pop('_id', None)
    return time_log


@api_router.post("/contractor/jobs/{job_id}/time/{time_id}/stop")
async def stop_time_log(
    job_id: str,
    time_id: str,
    request_data: TimeLogStopRequest,
    current_user: User = Depends(get_current_user_dependency)
):
    """Stop time tracking for a job"""
    if current_user.role != UserRole.CONTRACTOR:
        raise HTTPException(403, detail="Only contractors can stop time logs")

    # Find the active time log
    time_log = await db.time_logs.find_one({
        "id": time_id,
        "contractor_id": current_user.id,
        "job_id": job_id,
        "end_time": None
    })

    if not time_log:
        raise HTTPException(404, detail="Active time log not found")

    # Calculate duration
    start_time = datetime.fromisoformat(time_log['start_time'])
    end_time = datetime.utcnow()
    duration_minutes = int((end_time - start_time).total_seconds() / 60)

    update_data = {
        "end_time": end_time.isoformat(),
        "duration_minutes": duration_minutes,
        "updated_at": end_time.isoformat()
    }

    if request_data.notes:
        update_data["notes"] = request_data.notes

    await db.time_logs.update_one(
        {"id": time_id},
        {"$set": update_data}
    )

    logger.info(f"Time log stopped: {time_id}, duration: {duration_minutes} minutes")

    updated_log = await db.time_logs.find_one({"id": time_id})
    updated_log.pop('_id', None)
    return updated_log


@api_router.get("/contractor/jobs/{job_id}/time")
async def get_time_logs(
    job_id: str,
    current_user: User = Depends(get_current_user_dependency)
):
    """Get all time logs for a job"""
    if current_user.role != UserRole.CONTRACTOR:
        raise HTTPException(403, detail="Only contractors can access time logs")

    # Verify job belongs to this contractor
    job = await db.jobs.find_one({"id": job_id, "contractor_id": current_user.id})
    if not job:
        raise HTTPException(404, detail="Job not found or not assigned to you")

    logs = await db.time_logs.find({
        "contractor_id": current_user.id,
        "job_id": job_id
    }).sort("start_time", -1).to_list(100)

    for log in logs:
        log.pop('_id', None)
    return logs


# ==================== CONTRACTOR REPORTS ROUTES ====================


@api_router.get("/contractor/reports/monthly")
async def get_monthly_report(
    year: int,
    month: int,
    current_user: User = Depends(get_current_user_dependency)
):
    """Get monthly report for contractor"""
    if current_user.role != UserRole.CONTRACTOR:
        raise HTTPException(403, detail="Only contractors can access reports")

    # Query jobs for the month
    start_date = f"{year}-{month:02d}-01"
    if month == 12:
        end_date = f"{year + 1}-01-01"
    else:
        end_date = f"{year}-{month + 1:02d}-01"

    jobs = await db.jobs.find({
        "contractor_id": current_user.id,
        "created_at": {"$gte": start_date, "$lt": end_date}
    }).to_list(1000)

    completed_jobs = [j for j in jobs if j.get('status') == 'completed']

    # Calculate totals
    total_revenue = sum(j.get('contractor_invoice_amount', 0) for j in completed_jobs)

    # Get expenses for the month
    expenses = await db.expenses.find({
        "contractor_id": current_user.id,
        "date": {"$gte": start_date, "$lt": end_date}
    }).to_list(1000)

    total_expenses = sum(e.get('amount', 0) for e in expenses)

    # Get mileage for the month
    mileage_logs = await db.mileage_logs.find({
        "contractor_id": current_user.id,
        "date": {"$gte": start_date, "$lt": end_date}
    }).to_list(1000)

    total_mileage = sum(m.get('miles', 0) for m in mileage_logs)

    # Get time logs for the month
    time_logs = await db.time_logs.find({
        "contractor_id": current_user.id,
        "start_time": {"$gte": start_date, "$lt": end_date}
    }).to_list(1000)

    total_hours = sum(t.get('duration_minutes', 0) for t in time_logs) / 60

    report = {
        "year": year,
        "month": month,
        "contractor_id": current_user.id,
        "total_jobs": len(jobs),
        "completed_jobs": len(completed_jobs),
        "total_revenue": total_revenue,
        "total_expenses": total_expenses,
        "total_mileage": total_mileage,
        "total_hours": total_hours,
        "net_income": total_revenue - total_expenses
    }

    return report


@api_router.get("/contractor/reports/yearly")
async def get_yearly_report(
    year: int,
    current_user: User = Depends(get_current_user_dependency)
):
    """Get yearly report for contractor"""
    if current_user.role != UserRole.CONTRACTOR:
        raise HTTPException(403, detail="Only contractors can access reports")

    start_date = f"{year}-01-01"
    end_date = f"{year + 1}-01-01"

    # Get all jobs for the year
    jobs = await db.jobs.find({
        "contractor_id": current_user.id,
        "created_at": {"$gte": start_date, "$lt": end_date}
    }).to_list(10000)

    completed_jobs = [j for j in jobs if j.get('status') == 'completed']
    total_revenue = sum(j.get('contractor_invoice_amount', 0) for j in completed_jobs)

    # Get expenses
    expenses = await db.expenses.find({
        "contractor_id": current_user.id,
        "date": {"$gte": start_date, "$lt": end_date}
    }).to_list(10000)

    total_expenses = sum(e.get('amount', 0) for e in expenses)

    # Get mileage
    mileage_logs = await db.mileage_logs.find({
        "contractor_id": current_user.id,
        "date": {"$gte": start_date, "$lt": end_date}
    }).to_list(10000)

    total_mileage = sum(m.get('miles', 0) for m in mileage_logs)

    # Get time logs
    time_logs = await db.time_logs.find({
        "contractor_id": current_user.id,
        "start_time": {"$gte": start_date, "$lt": end_date}
    }).to_list(10000)

    total_hours = sum(t.get('duration_minutes', 0) for t in time_logs) / 60

    # Build monthly breakdown (stub for now)
    monthly_breakdown = []
    for month in range(1, 13):
        monthly_breakdown.append({
            "year": year,
            "month": month,
            "contractor_id": current_user.id,
            "total_jobs": 0,
            "completed_jobs": 0,
            "total_revenue": 0,
            "total_expenses": 0,
            "total_mileage": 0,
            "total_hours": 0,
            "net_income": 0
        })

    report = {
        "year": year,
        "contractor_id": current_user.id,
        "total_jobs": len(jobs),
        "completed_jobs": len(completed_jobs),
        "total_revenue": total_revenue,
        "total_expenses": total_expenses,
        "total_mileage": total_mileage,
        "total_hours": total_hours,
        "net_income": total_revenue - total_expenses,
        "monthly_breakdown": monthly_breakdown
    }

    return report


@api_router.get("/contractor/reports/tax")
async def get_tax_report(
    start_date: str,
    end_date: str,
    current_user: User = Depends(get_current_user_dependency)
):
    """Get tax report for contractor (for informational purposes only)"""
    if current_user.role != UserRole.CONTRACTOR:
        raise HTTPException(403, detail="Only contractors can access reports")

    # Get completed jobs
    jobs = await db.jobs.find({
        "contractor_id": current_user.id,
        "completed_at": {"$gte": start_date, "$lte": end_date},
        "status": "completed"
    }).to_list(10000)

    total_revenue = sum(j.get('contractor_invoice_amount', 0) for j in jobs)

    # Get expenses
    expenses = await db.expenses.find({
        "contractor_id": current_user.id,
        "date": {"$gte": start_date, "$lte": end_date}
    }).to_list(10000)

    total_expenses = sum(e.get('amount', 0) for e in expenses)

    # Get mileage
    mileage_logs = await db.mileage_logs.find({
        "contractor_id": current_user.id,
        "date": {"$gte": start_date, "$lte": end_date}
    }).to_list(10000)

    total_mileage = sum(m.get('miles', 0) for m in mileage_logs)

    # IRS standard mileage rate (2024: $0.67/mile)
    IRS_MILEAGE_RATE = 0.67
    mileage_deduction = total_mileage * IRS_MILEAGE_RATE

    total_deductions = total_expenses + mileage_deduction

    # Determine tax year from start_date
    tax_year = int(start_date.split('-')[0])

    report = {
        "contractor_id": current_user.id,
        "start_date": start_date,
        "end_date": end_date,
        "total_revenue": total_revenue,
        "total_expenses": total_expenses,
        "total_mileage": total_mileage,
        "mileage_deduction": mileage_deduction,
        "total_deductions": total_deductions,
        "net_income": total_revenue - total_deductions,
        "tax_year": tax_year,
        "disclaimer": "For informational purposes only. Not official tax documentation. Consult your tax professional."
    }

    return report


@api_router.get("/contractor/reports/tax/pdf")
async def export_tax_report_pdf(
    start_date: str,
    end_date: str,
    current_user: User = Depends(get_current_user_dependency)
):
    """Export tax report as PDF (stub - returns JSON for now)"""
    if current_user.role != UserRole.CONTRACTOR:
        raise HTTPException(403, detail="Only contractors can access reports")

    # For now, return the same data as the JSON endpoint
    # In production, this would generate a PDF using a library like reportlab
    report = await get_tax_report(start_date, end_date, current_user)

    return {
        "message": "PDF export not yet implemented",
        "data": report,
        "note": "Use the JSON endpoint for now"
    }


# ==================== WARRANTY SYSTEM ROUTES ====================


@api_router.post("/jobs/{job_id}/warranty/request")
async def create_warranty_request(
    job_id: str,
    request_data: WarrantyRequestCreate,
    current_user: User = Depends(get_current_user_dependency)
):
    """Create a warranty request for a completed job (customer only)"""
    if current_user.role != UserRole.CUSTOMER:
        raise HTTPException(403, detail="Only customers can request warranties")

    # Verify job exists and belongs to this customer
    job = await db.jobs.find_one({"id": job_id, "customer_id": current_user.id})
    if not job:
        raise HTTPException(404, detail="Job not found or not yours")

    # Verify job is completed
    if job.get("status") != "completed":
        raise HTTPException(400, detail="Can only request warranty on completed jobs")

    # Check if warranty request already exists for this job
    existing = await db.warranty_requests.find_one({"job_id": job_id})
    if existing:
        raise HTTPException(400, detail="Warranty request already exists for this job")

    warranty_request = {
        "id": str(uuid.uuid4()),
        "job_id": job_id,
        "customer_id": current_user.id,
        "contractor_id": job.get("contractor_id"),
        "issue_description": request_data.issue_description,
        "photo_urls": request_data.photo_urls,
        "status": WarrantyStatus.PENDING,
        "requested_at": datetime.utcnow().isoformat(),
        "decided_at": None,
        "decision_notes": None,
        "decided_by": None,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }

    await db.warranty_requests.insert_one(warranty_request)
    logger.info(f"Warranty request created: {warranty_request['id']} for job {job_id}")

    warranty_request.pop('_id', None)
    return warranty_request


@api_router.post("/jobs/{job_id}/warranty/approve")
async def approve_warranty_request(
    job_id: str,
    decision_data: WarrantyDecision,
    current_user: User = Depends(get_current_user_dependency)
):
    """Approve a warranty request (contractor or admin only)"""
    if current_user.role not in [UserRole.CONTRACTOR, UserRole.ADMIN]:
        raise HTTPException(403, detail="Only contractors or admins can approve warranties")

    # Find warranty request
    warranty = await db.warranty_requests.find_one({"job_id": job_id})
    if not warranty:
        raise HTTPException(404, detail="Warranty request not found")

    # If contractor, verify it's their job
    if current_user.role == UserRole.CONTRACTOR:
        if warranty.get("contractor_id") != current_user.id:
            raise HTTPException(403, detail="Not your job")

    # Verify warranty is pending
    if warranty.get("status") != WarrantyStatus.PENDING:
        raise HTTPException(400, detail="Warranty already decided")

    # Update warranty request
    await db.warranty_requests.update_one(
        {"job_id": job_id},
        {
            "$set": {
                "status": WarrantyStatus.APPROVED,
                "decided_at": datetime.utcnow().isoformat(),
                "decision_notes": decision_data.decision_notes,
                "decided_by": current_user.id,
                "updated_at": datetime.utcnow().isoformat()
            }
        }
    )

    logger.info(f"Warranty approved for job {job_id} by {current_user.id}")

    # Return updated warranty
    updated_warranty = await db.warranty_requests.find_one({"job_id": job_id})
    updated_warranty.pop('_id', None)
    return updated_warranty


@api_router.post("/jobs/{job_id}/warranty/deny")
async def deny_warranty_request(
    job_id: str,
    decision_data: WarrantyDecision,
    current_user: User = Depends(get_current_user_dependency)
):
    """Deny a warranty request (contractor or admin only)"""
    if current_user.role not in [UserRole.CONTRACTOR, UserRole.ADMIN]:
        raise HTTPException(403, detail="Only contractors or admins can deny warranties")

    # Find warranty request
    warranty = await db.warranty_requests.find_one({"job_id": job_id})
    if not warranty:
        raise HTTPException(404, detail="Warranty request not found")

    # If contractor, verify it's their job
    if current_user.role == UserRole.CONTRACTOR:
        if warranty.get("contractor_id") != current_user.id:
            raise HTTPException(403, detail="Not your job")

    # Verify warranty is pending
    if warranty.get("status") != WarrantyStatus.PENDING:
        raise HTTPException(400, detail="Warranty already decided")

    # Update warranty request
    await db.warranty_requests.update_one(
        {"job_id": job_id},
        {
            "$set": {
                "status": WarrantyStatus.DENIED,
                "decided_at": datetime.utcnow().isoformat(),
                "decision_notes": decision_data.decision_notes,
                "decided_by": current_user.id,
                "updated_at": datetime.utcnow().isoformat()
            }
        }
    )

    logger.info(f"Warranty denied for job {job_id} by {current_user.id}")

    # Return updated warranty
    updated_warranty = await db.warranty_requests.find_one({"job_id": job_id})
    updated_warranty.pop('_id', None)
    return updated_warranty


@api_router.get("/jobs/{job_id}/warranty/status")
async def get_warranty_status(
    job_id: str,
    current_user: User = Depends(get_current_user_dependency)
):
    """Get warranty request status for a job"""
    # Verify user has access to this job
    job = await db.jobs.find_one({"id": job_id})
    if not job:
        raise HTTPException(404, detail="Job not found")

    # Check if user is customer, contractor, or admin
    is_customer = current_user.id == job.get("customer_id")
    is_contractor = current_user.id == job.get("contractor_id")
    is_admin = current_user.role == UserRole.ADMIN

    if not (is_customer or is_contractor or is_admin):
        raise HTTPException(403, detail="Not authorized to view this warranty")

    # Get warranty request
    warranty = await db.warranty_requests.find_one({"job_id": job_id})
    if not warranty:
        return {"has_warranty": False, "message": "No warranty request for this job"}

    warranty.pop('_id', None)
    return {"has_warranty": True, "warranty": warranty}


# ==================== CHANGE ORDER SYSTEM ROUTES ====================


@api_router.post("/jobs/{job_id}/change-order/create")
async def create_change_order(
    job_id: str,
    change_order_data: ChangeOrderCreate,
    current_user: User = Depends(get_current_user_dependency)
):
    """Create a change order for a job (contractor only)"""
    if current_user.role != UserRole.CONTRACTOR:
        raise HTTPException(403, detail="Only contractors can create change orders")

    # Verify job exists and belongs to this contractor
    job = await db.jobs.find_one({"id": job_id, "contractor_id": current_user.id})
    if not job:
        raise HTTPException(404, detail="Job not found or not assigned to you")

    # Verify job is not completed or cancelled
    if job.get("status") in ["completed", "cancelled"]:
        raise HTTPException(400, detail="Cannot create change orders for completed or cancelled jobs")

    change_order = {
        "id": str(uuid.uuid4()),
        "job_id": job_id,
        "contractor_id": current_user.id,
        "customer_id": job.get("customer_id"),
        "description": change_order_data.description,
        "reason": change_order_data.reason,
        "additional_cost": change_order_data.additional_cost,
        "additional_hours": change_order_data.additional_hours,
        "photo_urls": change_order_data.photo_urls,
        "status": ChangeOrderStatus.PENDING,
        "requested_at": datetime.utcnow().isoformat(),
        "decided_at": None,
        "decision_notes": None,
        "decided_by": None,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }

    await db.change_orders.insert_one(change_order)
    logger.info(f"Change order created: {change_order['id']} for job {job_id}")

    change_order.pop('_id', None)
    return change_order


@api_router.post("/jobs/{job_id}/change-order/{change_order_id}/approve")
async def approve_change_order(
    job_id: str,
    change_order_id: str,
    decision_data: ChangeOrderDecision,
    current_user: User = Depends(get_current_user_dependency)
):
    """Approve a change order (customer or admin only)"""
    if current_user.role not in [UserRole.CUSTOMER, UserRole.ADMIN]:
        raise HTTPException(403, detail="Only customers or admins can approve change orders")

    # Find change order
    change_order = await db.change_orders.find_one({"id": change_order_id, "job_id": job_id})
    if not change_order:
        raise HTTPException(404, detail="Change order not found")

    # If customer, verify it's their job
    if current_user.role == UserRole.CUSTOMER:
        if change_order.get("customer_id") != current_user.id:
            raise HTTPException(403, detail="Not your job")

    # Verify change order is pending
    if change_order.get("status") != ChangeOrderStatus.PENDING:
        raise HTTPException(400, detail="Change order already decided")

    # Update change order
    await db.change_orders.update_one(
        {"id": change_order_id},
        {
            "$set": {
                "status": ChangeOrderStatus.APPROVED,
                "decided_at": datetime.utcnow().isoformat(),
                "decision_notes": decision_data.decision_notes,
                "decided_by": current_user.id,
                "updated_at": datetime.utcnow().isoformat()
            }
        }
    )

    # Update job total cost if change order is approved
    job = await db.jobs.find_one({"id": job_id})
    if job:
        current_cost = job.get("contractor_invoice_amount", 0)
        new_cost = current_cost + change_order.get("additional_cost", 0)
        await db.jobs.update_one(
            {"id": job_id},
            {"$set": {"contractor_invoice_amount": new_cost, "updated_at": datetime.utcnow().isoformat()}}
        )

    logger.info(f"Change order {change_order_id} approved for job {job_id} by {current_user.id}")

    # Return updated change order
    updated_change_order = await db.change_orders.find_one({"id": change_order_id})
    updated_change_order.pop('_id', None)
    return updated_change_order


@api_router.post("/jobs/{job_id}/change-order/{change_order_id}/reject")
async def reject_change_order(
    job_id: str,
    change_order_id: str,
    decision_data: ChangeOrderDecision,
    current_user: User = Depends(get_current_user_dependency)
):
    """Reject a change order (customer or admin only)"""
    if current_user.role not in [UserRole.CUSTOMER, UserRole.ADMIN]:
        raise HTTPException(403, detail="Only customers or admins can reject change orders")

    # Find change order
    change_order = await db.change_orders.find_one({"id": change_order_id, "job_id": job_id})
    if not change_order:
        raise HTTPException(404, detail="Change order not found")

    # If customer, verify it's their job
    if current_user.role == UserRole.CUSTOMER:
        if change_order.get("customer_id") != current_user.id:
            raise HTTPException(403, detail="Not your job")

    # Verify change order is pending
    if change_order.get("status") != ChangeOrderStatus.PENDING:
        raise HTTPException(400, detail="Change order already decided")

    # Update change order
    await db.change_orders.update_one(
        {"id": change_order_id},
        {
            "$set": {
                "status": ChangeOrderStatus.REJECTED,
                "decided_at": datetime.utcnow().isoformat(),
                "decision_notes": decision_data.decision_notes,
                "decided_by": current_user.id,
                "updated_at": datetime.utcnow().isoformat()
            }
        }
    )

    logger.info(f"Change order {change_order_id} rejected for job {job_id} by {current_user.id}")

    # Return updated change order
    updated_change_order = await db.change_orders.find_one({"id": change_order_id})
    updated_change_order.pop('_id', None)
    return updated_change_order


@api_router.get("/jobs/{job_id}/change-orders")
async def list_change_orders(
    job_id: str,
    current_user: User = Depends(get_current_user_dependency)
):
    """List all change orders for a job"""
    # Verify user has access to this job
    job = await db.jobs.find_one({"id": job_id})
    if not job:
        raise HTTPException(404, detail="Job not found")

    # Check if user is customer, contractor, or admin
    is_customer = current_user.id == job.get("customer_id")
    is_contractor = current_user.id == job.get("contractor_id")
    is_admin = current_user.role == UserRole.ADMIN

    if not (is_customer or is_contractor or is_admin):
        raise HTTPException(403, detail="Not authorized to view change orders for this job")

    # Get all change orders for this job
    change_orders = await db.change_orders.find({"job_id": job_id}).sort("created_at", -1).to_list(1000)

    for co in change_orders:
        co.pop('_id', None)

    return {"job_id": job_id, "change_orders": change_orders, "count": len(change_orders)}


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


@api_router.get("/admin/users")
async def admin_list_users(
    role: Optional[UserRole] = None,
    limit: int = 100,
    offset: int = 0,
    current_user: User = Depends(require_admin)
):
    """List all users with optional role filtering (admin only)"""
    query = {}
    if role:
        query["role"] = role

    users = await db.users.find(query).skip(offset).limit(limit).to_list(limit)

    for user in users:
        user.pop('_id', None)

    return {
        "users": users,
        "count": len(users),
        "total": await db.users.count_documents(query)
    }


@api_router.get("/admin/jobs/all")
async def admin_list_all_jobs(
    status: Optional[JobStatus] = None,
    limit: int = 100,
    offset: int = 0,
    current_user: User = Depends(require_admin)
):
    """List all jobs system-wide with optional status filtering (admin only)"""
    query = {}
    if status:
        query["status"] = status

    jobs = await db.jobs.find(query).sort("created_at", -1).skip(offset).limit(limit).to_list(limit)

    for job in jobs:
        job.pop('_id', None)

    return {
        "jobs": jobs,
        "count": len(jobs),
        "total": await db.jobs.count_documents(query)
    }


@api_router.get("/admin/stats")
async def admin_get_system_stats(
    current_user: User = Depends(require_admin)
):
    """Get system-wide statistics (admin only)"""
    # Count users by role
    total_users = await db.users.count_documents({})
    customers = await db.users.count_documents({"role": UserRole.CUSTOMER})
    contractors = await db.users.count_documents({"role": UserRole.CONTRACTOR})

    # Count jobs by status
    total_jobs = await db.jobs.count_documents({})
    pending_jobs = await db.jobs.count_documents({"status": "pending"})
    in_progress_jobs = await db.jobs.count_documents({"status": "in_progress"})
    completed_jobs = await db.jobs.count_documents({"status": "completed"})

    # Calculate revenue (sum of completed job amounts)
    completed_job_docs = await db.jobs.find({"status": "completed"}).to_list(10000)
    total_revenue = sum(job.get("contractor_invoice_amount", 0) for job in completed_job_docs)

    # Count quotes
    total_quotes = await db.quotes.count_documents({})
    pending_quotes = await db.quotes.count_documents({"status": QuoteStatus.DRAFT})

    # Count warranty requests
    total_warranties = await db.warranty_requests.count_documents({})
    pending_warranties = await db.warranty_requests.count_documents({"status": "pending"})

    # Count change orders
    total_change_orders = await db.change_orders.count_documents({})
    pending_change_orders = await db.change_orders.count_documents({"status": "pending"})

    return {
        "users": {
            "total": total_users,
            "customers": customers,
            "contractors": contractors
        },
        "jobs": {
            "total": total_jobs,
            "pending": pending_jobs,
            "in_progress": in_progress_jobs,
            "completed": completed_jobs
        },
        "revenue": {
            "total": total_revenue,
            "completed_jobs_count": len(completed_job_docs)
        },
        "quotes": {
            "total": total_quotes,
            "pending": pending_quotes
        },
        "warranties": {
            "total": total_warranties,
            "pending": pending_warranties
        },
        "change_orders": {
            "total": total_change_orders,
            "pending": pending_change_orders
        }
    }


@api_router.get("/admin/provider-gate/status")
async def admin_get_provider_gate_status(
    current_user: User = Depends(require_admin)
):
    """Get provider gate configuration status (admin only)"""
    from utils import get_provider_gate_status
    return get_provider_gate_status()


@api_router.post("/admin/provider-gate/configure")
async def admin_configure_provider_gate(
    allowed_provider_types: str,
    current_user: User = Depends(require_admin)
):
    """
    Update provider gate configuration (admin only)

    Note: This updates an environment variable which requires a server restart to take effect.
    In production, consider using a config file or database-backed configuration.
    """
    valid_values = ["both", "licensed_only", "handyman_only", "contractors_disabled"]

    if allowed_provider_types not in valid_values:
        raise HTTPException(
            400,
            detail=f"Invalid value. Must be one of: {', '.join(valid_values)}"
        )

    logger.warning(
        f"Admin {current_user.email} attempted to change ALLOWED_PROVIDER_TYPES to '{allowed_provider_types}'. "
        "This requires manual environment variable update and server restart."
    )

    return {
        "message": "Provider gate configuration noted. Please update ALLOWED_PROVIDER_TYPES environment variable and restart the server.",
        "requested_value": allowed_provider_types,
        "note": "This endpoint logs the request but does not modify runtime config. Update .env file manually."
    }


# ==================== PHASE 4: JOB FEED & PROPOSALS ====================


@api_router.get("/handyman/jobs/feed")
async def get_jobs_feed(
    limit: int = 50,
    offset: int = 0,
    current_user: User = Depends(require_technician_or_admin)
):
    """
    Get available jobs feed for handyman/contractor.
    Filters by skills, location (50 mile radius), and contractor type preference.
    """
    jobs = await job_feed_service.get_available_jobs_feed(
        contractor_id=current_user.id,
        limit=limit,
        offset=offset
    )

    # Convert to dict for JSON serialization
    return [job.model_dump() for job in jobs]


@api_router.get("/handyman/jobs/active")
async def get_active_jobs(
    limit: int = 50,
    offset: int = 0,
    current_user: User = Depends(require_technician_or_admin)
):
    """
    Get active jobs for handyman/contractor.
    Jobs where contractor is assigned and status is active.
    """
    jobs = await job_feed_service.get_active_jobs(
        contractor_id=current_user.id,
        limit=limit,
        offset=offset
    )

    return [job.model_dump() for job in jobs]


@api_router.get("/handyman/jobs/history")
async def get_job_history(
    limit: int = 50,
    offset: int = 0,
    current_user: User = Depends(require_technician_or_admin)
):
    """
    Get job history for handyman/contractor.
    Completed and cancelled jobs.
    """
    jobs = await job_feed_service.get_job_history(
        contractor_id=current_user.id,
        limit=limit,
        offset=offset
    )

    return [job.model_dump() for job in jobs]


@api_router.patch("/jobs/{job_id}/status")
async def update_job_status(
    job_id: str,
    status_update: JobStatusUpdate,
    current_user: User = Depends(get_current_user_dependency)
):
    """
    Update job status using state machine.
    Enforces allowed transitions and handles side effects.
    """
    # Get job
    job_data = await db.jobs.find_one({"id": job_id})
    if not job_data:
        raise HTTPException(status_code=404, detail="Job not found")

    job = Job(**job_data)

    # Determine actor role and validate permissions
    actor_role = current_user.role.value

    # Verify user has permission for this transition
    if current_user.role == UserRole.CUSTOMER:
        if job.customer_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not your job")
    elif current_user.role in [UserRole.HANDYMAN, UserRole.CONTRACTOR]:
        if job.assigned_contractor_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not assigned to you")

    # Prepare additional data
    additional_data = {}
    if status_update.scheduled_start:
        additional_data["scheduled_start"] = status_update.scheduled_start
    if status_update.scheduled_end:
        additional_data["scheduled_end"] = status_update.scheduled_end

    # Apply transition
    try:
        from services.job_lifecycle import JobLifecycleError
        updated_job = await job_lifecycle.apply_transition(
            job=job,
            new_status=status_update.status,
            actor_id=current_user.id,
            actor_role=actor_role,
            additional_data=additional_data if additional_data else None
        )

        return updated_job.model_dump()
    except JobLifecycleError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ==================== PROPOSALS ====================


@api_router.post("/jobs/{job_id}/proposals")
async def create_proposal(
    job_id: str,
    proposal_request: ProposalCreateRequest,
    current_user: User = Depends(require_technician_or_admin)
):
    """
    Create a proposal for a job (handyman/contractor only).
    Only valid when job status = published.
    """
    # Check provider_status - only active providers can create proposals
    if current_user.role in [UserRole.HANDYMAN, UserRole.CONTRACTOR]:
        if current_user.provider_status != "active":
            raise HTTPException(
                403,
                detail={
                    "error": "Provider not active",
                    "provider_status": current_user.provider_status,
                    "message": "You must complete your profile and verification to submit proposals"
                }
            )

    try:
        from services.proposal_service import ProposalError
        proposal = await proposal_service.create_proposal(
            job_id=job_id,
            contractor_id=current_user.id,
            contractor_role=current_user.role,
            proposal_request=proposal_request
        )

        return ProposalResponse(
            id=proposal.id,
            job_id=proposal.job_id,
            contractor_id=proposal.contractor_id,
            quoted_price=proposal.quoted_price,
            status=proposal.status,
            created_at=proposal.created_at
        ).model_dump()
    except ProposalError as e:
        raise HTTPException(status_code=400, detail=str(e))


@api_router.get("/jobs/{job_id}/proposals")
async def get_proposals_for_job(
    job_id: str,
    current_user: User = Depends(get_current_user_dependency)
):
    """
    Get all proposals for a job (customer only).
    """
    if current_user.role != UserRole.CUSTOMER:
        raise HTTPException(status_code=403, detail="Only customers can view proposals")

    try:
        from services.proposal_service import ProposalError
        proposals = await proposal_service.get_proposals_for_job(
            job_id=job_id,
            customer_id=current_user.id
        )

        return [proposal.model_dump() for proposal in proposals]
    except ProposalError as e:
        raise HTTPException(status_code=400, detail=str(e))


@api_router.post("/proposals/{proposal_id}/accept")
async def accept_proposal(
    proposal_id: str,
    current_user: User = Depends(get_current_user_dependency)
):
    """
    Accept a proposal (customer only).
    Sets proposal status, assigns contractor to job, moves job to proposal_selected.
    """
    if current_user.role != UserRole.CUSTOMER:
        raise HTTPException(status_code=403, detail="Only customers can accept proposals")

    # Get proposal
    proposal_data = await db.proposals.find_one({"id": proposal_id})
    if not proposal_data:
        raise HTTPException(status_code=404, detail="Proposal not found")

    proposal = Proposal(**proposal_data)

    # Get job
    job_data = await db.jobs.find_one({"id": proposal.job_id})
    if not job_data:
        raise HTTPException(status_code=404, detail="Job not found")

    job = Job(**job_data)

    # Verify customer owns the job
    if job.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not your job")

    # Verify proposal is pending
    if proposal.status != ProposalStatus.PENDING:
        raise HTTPException(status_code=400, detail=f"Proposal status is {proposal.status}, must be pending")

    # Apply transition using lifecycle service
    try:
        from services.job_lifecycle import JobLifecycleError
        updated_job = await job_lifecycle.apply_transition(
            job=job,
            new_status=JobStatus.PROPOSAL_SELECTED,
            actor_id=current_user.id,
            actor_role=current_user.role.value,
            additional_data={
                "accepted_proposal_id": proposal.id,
                "assigned_contractor_id": proposal.contractor_id
            }
        )

        return {
            "message": "Proposal accepted",
            "job": updated_job.model_dump()
        }
    except JobLifecycleError as e:
        raise HTTPException(status_code=400, detail=str(e))


@api_router.post("/proposals/{proposal_id}/withdraw")
async def withdraw_proposal(
    proposal_id: str,
    current_user: User = Depends(require_technician_or_admin)
):
    """
    Withdraw a proposal (contractor only).
    """
    try:
        from services.proposal_service import ProposalError
        proposal = await proposal_service.withdraw_proposal(
            proposal_id=proposal_id,
            contractor_id=current_user.id
        )

        return proposal.model_dump()
    except ProposalError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ==================== PAYOUTS & WALLET ====================


@api_router.get("/handyman/wallet/summary")
async def get_wallet_summary(
    current_user: User = Depends(require_technician_or_admin)
):
    """
    Get wallet summary for handyman/contractor.
    Shows lifetime earnings, available balance, and pending payouts.
    """
    summary = await payout_service.get_wallet_summary(current_user.id)
    return summary.model_dump()


@api_router.get("/handyman/payouts")
async def get_payouts(
    limit: int = 50,
    offset: int = 0,
    current_user: User = Depends(require_technician_or_admin)
):
    """
    Get paginated list of payouts for handyman/contractor.
    """
    payouts = await payout_service.get_payouts(
        contractor_id=current_user.id,
        limit=limit,
        offset=offset
    )

    return [payout.model_dump() for payout in payouts]


# ==================== GROWTH TRACKING ====================


@api_router.get("/handyman/growth/summary")
async def get_growth_summary(
    current_user: User = Depends(require_technician_or_admin)
):
    """
    Get growth summary for handyman/contractor.
    Shows job count, revenue, ratings, and business milestones.
    """
    summary = await growth_service.get_summary(current_user.id)

    if not summary:
        # Return empty summary if none exists yet
        return GrowthSummary(
            user_id=current_user.id,
            role=ContractorGrowthRole.HANDYMAN if current_user.role == UserRole.HANDYMAN else ContractorGrowthRole.CONTRACTOR
        ).model_dump()

    return summary.model_dump()


@api_router.get("/handyman/growth/events")
async def get_growth_events(
    limit: int = 50,
    offset: int = 0,
    current_user: User = Depends(require_technician_or_admin)
):
    """
    Get paginated growth events for handyman/contractor.
    Shows timeline of milestones and achievements.
    """
    events = await growth_service.get_events(
        user_id=current_user.id,
        limit=limit,
        offset=offset
    )

    return [event.model_dump() for event in events]


# ==================== UTILITY ROUTES ====================


@api_router.get("/")
async def root(): # type: ignore
    """API health check"""
    return {
        "message": "The Real Johnson Handyman Services API",
        "version": "1.0.0",
        "status": "running",
    }


# Basic Auth for n8n health monitoring
security = HTTPBasic()

def n8n_basic_auth(credentials: HTTPBasicCredentials = Depends(security)):
    expected_user = os.getenv("N8N_BASIC_USER", "")
    expected_pass = os.getenv("N8N_BASIC_PASS", "")
    ok_user = secrets.compare_digest(credentials.username, expected_user)
    ok_pass = secrets.compare_digest(credentials.password, expected_pass)
    if not (ok_user and ok_pass):
        raise HTTPException(
            status_code=401,
            detail="Unauthorized",
            headers={"WWW-Authenticate": "Basic"},
        )
    return True

@api_router.get("/health")
async def health_check(_: bool = Depends(n8n_basic_auth)):
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
        # Existing indexes
        await db.users.create_index("email", unique=True)
        await db.quotes.create_index("customer_id")
        await db.quotes.create_index("status")
        await db.services.create_index("category")

        # Phase 4: Jobs indexes
        await db.jobs.create_index("status")
        await db.jobs.create_index("service_category")
        await db.jobs.create_index([("address.zip", 1)])
        await db.jobs.create_index([("address.lat", "2dsphere"), ("address.lon", "2dsphere")])
        await db.jobs.create_index("assigned_contractor_id")
        await db.jobs.create_index("customer_id")

        # Phase 4: Proposals indexes
        await db.proposals.create_index("job_id")
        await db.proposals.create_index("contractor_id")
        await db.proposals.create_index("status")

        # Phase 4: Payouts indexes
        await db.payouts.create_index("contractor_id")
        await db.payouts.create_index("status")
        await db.payouts.create_index("job_id")

        # Phase 4: Growth Events indexes
        await db.growth_events.create_index("user_id")
        await db.growth_events.create_index("type")
        await db.growth_events.create_index([("user_id", 1), ("created_at", -1)])

        # Phase 4: Growth Summary indexes
        await db.growth_summary.create_index("user_id", unique=True)

        # Addresses collection indexes
        await db.addresses.create_index("user_id")
        await db.addresses.create_index([("user_id", 1), ("is_default", 1)])
        await db.addresses.create_index("id", unique=True)

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
        {
            "category": ServiceCategory.HVAC,
            "title": "HVAC Maintenance & Repair",
            "description": "Heating, ventilation, and air conditioning maintenance and repair services",
            "pricing_model": PricingModel.HOURLY,
            "base_price": 125.0,
            "unit_label": "per hour",
            "typical_duration": 120,
            "min_charge": 150.0,
            "labor_multiplier": 1.3,
        },
        {
            "category": ServiceCategory.FLOORING,
            "title": "Flooring Installation & Repair",
            "description": "Professional flooring installation and repair for hardwood, tile, laminate, and vinyl",
            "pricing_model": PricingModel.UNIT,
            "base_price": 8.0,
            "unit_label": "per sqft",
            "typical_duration": 480,
            "min_charge": 200.0,
            "labor_multiplier": 1.2,
        },
        {
            "category": ServiceCategory.ROOFING,
            "title": "Roof Repair & Maintenance",
            "description": "Roof leak repair, shingle replacement, and general roof maintenance",
            "pricing_model": PricingModel.HOURLY,
            "base_price": 110.0,
            "unit_label": "per hour",
            "typical_duration": 240,
            "min_charge": 200.0,
            "labor_multiplier": 1.4,
        },
        {
            "category": ServiceCategory.LANDSCAPING,
            "title": "Landscaping & Yard Maintenance",
            "description": "Lawn care, garden maintenance, trimming, and general landscaping services",
            "pricing_model": PricingModel.HOURLY,
            "base_price": 65.0,
            "unit_label": "per hour",
            "typical_duration": 180,
            "min_charge": 100.0,
            "labor_multiplier": 0.9,
        },
        {
            "category": ServiceCategory.APPLIANCE_REPAIR,
            "title": "Appliance Repair",
            "description": "Repair and maintenance for household appliances including washers, dryers, refrigerators, and more",
            "pricing_model": PricingModel.FLAT,
            "base_price": 150.0,
            "unit_label": "per appliance",
            "typical_duration": 120,
            "min_charge": 150.0,
            "labor_multiplier": 1.2,
        },
        {
            "category": ServiceCategory.WINDOW_DOOR_INSTALLATION,
            "title": "Window & Door Installation",
            "description": "Professional installation and replacement of windows and doors",
            "pricing_model": PricingModel.FLAT,
            "base_price": 350.0,
            "unit_label": "per unit",
            "typical_duration": 240,
            "min_charge": 350.0,
            "labor_multiplier": 1.3,
        },
        {
            "category": ServiceCategory.TILE_WORK,
            "title": "Tile Installation & Repair",
            "description": "Tile installation and repair for bathrooms, kitchens, and floors",
            "pricing_model": PricingModel.UNIT,
            "base_price": 12.0,
            "unit_label": "per sqft",
            "typical_duration": 360,
            "min_charge": 180.0,
            "labor_multiplier": 1.2,
        },
        {
            "category": ServiceCategory.DECK_FENCE,
            "title": "Deck & Fence Construction/Repair",
            "description": "Building and repairing decks, fences, and outdoor structures",
            "pricing_model": PricingModel.HOURLY,
            "base_price": 85.0,
            "unit_label": "per hour",
            "typical_duration": 480,
            "min_charge": 200.0,
            "labor_multiplier": 1.1,
        },
        {
            "category": ServiceCategory.GUTTER_CLEANING,
            "title": "Gutter Cleaning & Maintenance",
            "description": "Professional gutter cleaning, debris removal, and downspout maintenance",
            "pricing_model": PricingModel.FLAT,
            "base_price": 120.0,
            "unit_label": "per service",
            "typical_duration": 90,
            "min_charge": 120.0,
            "labor_multiplier": 0.8,
        },
        {
            "category": ServiceCategory.PRESSURE_WASHING,
            "title": "Pressure Washing",
            "description": "Power washing for driveways, siding, decks, patios, and exterior surfaces",
            "pricing_model": PricingModel.HOURLY,
            "base_price": 75.0,
            "unit_label": "per hour",
            "typical_duration": 120,
            "min_charge": 100.0,
            "labor_multiplier": 0.9,
        },
    ]

    for service_data in default_services:
        service = Service(**service_data)
        service.created_at = datetime.utcnow()
        service.updated_at = datetime.utcnow()
        await db.services.insert_one(service.model_dump())

    logger.info(f"Seeded {len(default_services)} default services")

    
@app.get("/")
def root():
    return RedirectResponse(url="/api/health", status_code=307)

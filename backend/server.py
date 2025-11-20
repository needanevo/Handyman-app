from fastapi import FastAPI, APIRouter, HTTPException, status, Depends, Body, Request, UploadFile, File, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from providers import EMAIL_PROVIDERS, AI_PROVIDERS, MAPS_PROVIDERS
from fastapi.responses import RedirectResponse
from providers.linode_storage_provider import LinodeObjectStorage
from providers.quote_email_service import QuoteEmailService



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
from models import (
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
from models.job import Job, JobCreate, JobUpdate, JobStatus, JobCreateRequest, JobCreateResponse

# Import authentication
from auth.auth_handler import (
    AuthHandler,
    get_current_user,
    require_admin,
    require_technician_or_admin,
)

# Import services
from services.pricing_engine import PricingEngine
from services.contractor_routing import ContractorRouter

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
            business_name=user_data.businessName if user_data.businessName else None,
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
    service = Service(**service_data.model_dump())
    service.created_at = datetime.utcnow()
    service.updated_at = datetime.utcnow()

    await db.services.insert_one(service.model_dump())
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
    3. Creates job record with status='requested'
    4. Sends notifications (email + SMS to homeowner, email to admin)
    5. Returns job_id, status, estimated_total, created_at
    """
    # Validate address belongs to customer
    address = await db.users.find_one(
        {"id": current_user.id, "addresses.id": job_data.address_id},
        {"addresses.$": 1}
    )
    if not address or not address.get("addresses"):
        raise HTTPException(404, detail="Address not found")

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
        if job_data.urgency == "urgent":
            estimated_total *= 1.25  # 25% urgency surcharge

        # Cap at budget_max if provided
        if job_data.budget_max and estimated_total > job_data.budget_max:
            estimated_total = job_data.budget_max

    # Create job
    job = Job(
        customer_id=current_user.id,
        service_category=job_data.service_category,
        description=job_data.description,
        photos=job_data.photos,
        address_id=job_data.address_id,
        budget_min=job_data.budget_min,
        budget_max=job_data.budget_max,
        urgency=job_data.urgency,
        preferred_dates=job_data.preferred_dates,
        source=job_data.source,
        status=JobStatus.REQUESTED,
        estimated_total=estimated_total,
    )

    # Save job to MongoDB
    job_doc = job.model_dump()
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
       (current_user.role == UserRole.TECHNICIAN and job.get("contractor_id") != current_user.id):
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
    elif current_user.role == UserRole.TECHNICIAN:
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

    if current_user.role == UserRole.TECHNICIAN and job.get("contractor_id") != current_user.id:
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
    if current_user.role != UserRole.TECHNICIAN:
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
    if current_user.role != UserRole.TECHNICIAN:
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


@api_router.get("/contractor/jobs/accepted")
async def get_accepted_jobs(
    current_user: User = Depends(get_current_user_dependency)
):
    """
    Get accepted jobs for contractor.

    Returns jobs that have been accepted by this contractor but not yet scheduled.
    """
    # Only contractors can access this endpoint
    if current_user.role != UserRole.TECHNICIAN:
        raise HTTPException(403, detail="Only contractors can access accepted jobs")

    # Get accepted jobs (assigned to contractor, pending or accepted status)
    accepted_jobs = await db.jobs.find({
        "contractor_id": current_user.id,
        "status": {"$in": ["accepted", "pending"]}
    }).sort("created_at", -1).to_list(length=100)

    logger.info(f"Contractor {current_user.id} retrieved {len(accepted_jobs)} accepted jobs")

    return accepted_jobs


@api_router.get("/contractor/jobs/scheduled")
async def get_scheduled_jobs(
    current_user: User = Depends(get_current_user_dependency)
):
    """
    Get scheduled jobs for contractor.

    Returns jobs that have been scheduled with a specific date/time.
    """
    # Only contractors can access this endpoint
    if current_user.role != UserRole.TECHNICIAN:
        raise HTTPException(403, detail="Only contractors can access scheduled jobs")

    # Get scheduled jobs
    scheduled_jobs = await db.jobs.find({
        "contractor_id": current_user.id,
        "status": "scheduled"
    }).sort("scheduled_date", 1).to_list(length=100)  # Soonest first

    logger.info(f"Contractor {current_user.id} retrieved {len(scheduled_jobs)} scheduled jobs")

    return scheduled_jobs


@api_router.get("/contractor/jobs/completed")
async def get_completed_jobs(
    current_user: User = Depends(get_current_user_dependency)
):
    """
    Get completed jobs for contractor.

    Returns all jobs with status 'completed' assigned to this contractor.
    """
    # Only contractors can access this endpoint
    if current_user.role != UserRole.TECHNICIAN:
        raise HTTPException(403, detail="Only contractors can access completed jobs")

    # Get completed jobs
    completed_jobs = await db.jobs.find({
        "contractor_id": current_user.id,
        "status": "completed"
    }).sort("completed_at", -1).to_list(length=100)  # Latest first, max 100

    logger.info(f"Contractor {current_user.id} retrieved {len(completed_jobs)} completed jobs")

    return completed_jobs


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
        {"id": current_user.id}, {"$push": {"addresses": address.model_dump()}}
    )

    return {"message": "Address added successfully", "address_id": address.id}


@api_router.put("/profile/addresses/business")
async def update_business_address(
    address: Address, current_user: User = Depends(get_current_user_dependency)
):
    """Update or set business address (replaces first address or adds if none exist)"""
    # Geocode address if maps provider is available
    if maps_provider:
        try:
            geocode_result = await maps_provider.geocode(
                f"{address.street}, {address.city}, {address.state} {address.zip_code}"
            )
            if geocode_result:
                address.latitude = geocode_result["latitude"]
                address.longitude = geocode_result["longitude"]
                logger.info(f"Geocoded address: {address.latitude}, {address.longitude}")
        except Exception as e:
            logger.warning(f"Geocoding failed: {e}")

    # Replace first address or add if no addresses exist
    if current_user.addresses and len(current_user.addresses) > 0:
        # Update first address (business address)
        await db.users.update_one(
            {"id": current_user.id},
            {"$set": {"addresses.0": address.model_dump()}}
        )
        logger.info(f"Updated business address for user {current_user.id}")
    else:
        # No addresses exist, add the first one
        await db.users.update_one(
            {"id": current_user.id},
            {"$push": {"addresses": address.model_dump()}}
        )
        logger.info(f"Added first business address for user {current_user.id}")

    return {"message": "Business address updated successfully", "address": address.model_dump()}


@api_router.get("/profile/addresses", response_model=List[Address])
async def get_addresses(current_user: User = Depends(get_current_user_dependency)):
    """Get user addresses"""
    return current_user.addresses


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
    if current_user.role != UserRole.TECHNICIAN:
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


@api_router.patch("/contractors/portfolio")
async def update_contractor_portfolio(
    request_body: dict,
    current_user: User = Depends(get_current_user_dependency)
):
    """
    Update contractor portfolio photos.

    Expected structure:
    {
        "portfolio_photos": ["https://...", "https://...", ...]
    }
    """
    if current_user.role != UserRole.TECHNICIAN:
        raise HTTPException(403, detail="Only contractors can update portfolio")

    # Extract portfolio_photos from request body
    portfolio_photos = request_body.get("portfolio_photos", [])

    # Validate photo URLs
    if not isinstance(portfolio_photos, list):
        raise HTTPException(400, detail="portfolio_photos must be an array")

    for url in portfolio_photos:
        if not isinstance(url, str) or not url.startswith("http"):
            raise HTTPException(400, detail="All portfolio photos must be valid URLs")

    # Update portfolio in database
    result = await db.users.update_one(
        {"id": current_user.id},
        {
            "$set": {
                "portfolio_photos": portfolio_photos,
                "updated_at": datetime.utcnow().isoformat()
            }
        }
    )

    if result.modified_count > 0:
        logger.info(f"Updated portfolio for contractor {current_user.id} ({len(portfolio_photos)} photos)")
        return {"message": "Portfolio updated successfully", "count": len(portfolio_photos)}
    else:
        raise HTTPException(500, detail="Failed to update portfolio")


@api_router.patch("/contractors/profile")
async def update_contractor_profile(
    profile_data: dict,
    current_user: User = Depends(get_current_user_dependency)
):
    """
    Update contractor profile (skills, experience, business info).

    Expected structure:
    {
        "skills": ["Drywall", "Painting", ...],
        "years_experience": 10,
        "business_name": "John's Handyman Services"
    }
    """
    if current_user.role != UserRole.TECHNICIAN:
        raise HTTPException(403, detail="Only contractors can update profile")

    # Build update dict with only provided fields
    update_fields = {}
    if "skills" in profile_data:
        update_fields["skills"] = profile_data["skills"]
    if "years_experience" in profile_data:
        update_fields["years_experience"] = profile_data["years_experience"]
    if "business_name" in profile_data:
        update_fields["business_name"] = profile_data["business_name"]

    if not update_fields:
        raise HTTPException(400, detail="No fields to update")

    update_fields["updated_at"] = datetime.utcnow().isoformat()

    # Update profile in database
    result = await db.users.update_one(
        {"id": current_user.id},
        {"$set": update_fields}
    )

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
    if current_user.role != UserRole.TECHNICIAN:
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
    if current_user.role != UserRole.TECHNICIAN:
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
    if current_user.role != UserRole.TECHNICIAN:
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
    if current_user.role != UserRole.TECHNICIAN:
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
    if current_user.role != UserRole.TECHNICIAN:
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
    if current_user.role != UserRole.TECHNICIAN:
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
    if current_user.role != UserRole.TECHNICIAN:
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

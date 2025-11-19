# Backend Jobs Endpoint Specification

## Quick Reference for Backend Implementation

This document provides the exact specification for the `POST /api/jobs` endpoint that the frontend now expects.

---

## Endpoint Overview

**URL**: `POST /api/jobs`
**Authentication**: Required (Bearer token)
**Content-Type**: `application/json`

---

## Request Schema

### TypeScript Interface (for reference)
```typescript
interface JobCreateRequest {
  service_category: string;      // Required: "drywall" | "painting" | "electrical" | etc.
  address_id: string;            // Required: UUID of customer address
  description: string;           // Required: Free-text description of work needed
  photos: string[];              // Optional: Array of Linode photo URLs
  preferred_dates: string[];     // Optional: Array of ISO date strings ["2025-11-20", ...]
  budget_min: number;            // Optional: Minimum budget (can be 0)
  budget_max: number;            // Optional: Maximum budget (can be 0)
  urgency: string;               // Required: "flexible" | "normal" | "urgent"
  source: string;                // Required: "app" (for tracking where job came from)
  status: string;                // Required: "requested" (initial status)
}
```

### Pydantic Model (Python)
```python
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class JobCreateRequest(BaseModel):
    service_category: str = Field(..., description="Service category ID")
    address_id: str = Field(..., description="Customer address UUID")
    description: str = Field(..., min_length=10, description="Work description")
    photos: Optional[List[str]] = Field(default=[], description="Photo URLs from Linode")
    preferred_dates: Optional[List[str]] = Field(default=[], description="Preferred dates (ISO format)")
    budget_min: Optional[float] = Field(default=0, ge=0, description="Minimum budget")
    budget_max: Optional[float] = Field(default=0, ge=0, description="Maximum budget")
    urgency: str = Field(..., pattern="^(flexible|normal|urgent)$", description="Urgency level")
    source: str = Field(default="app", description="Source of job creation")
    status: str = Field(default="requested", description="Initial status")

    class Config:
        json_schema_extra = {
            "example": {
                "service_category": "drywall",
                "address_id": "123e4567-e89b-12d3-a456-426614174000",
                "description": "Need to patch a hole in bedroom wall from removing old shelf",
                "photos": [
                    "https://photos.us-iad-10.linodeobjects.com/customers/abc/quotes/temp_xyz/photo.jpg"
                ],
                "preferred_dates": ["2025-11-20", "2025-11-21"],
                "budget_min": 0,
                "budget_max": 300,
                "urgency": "normal",
                "source": "app",
                "status": "requested"
            }
        }
```

### Example Request
```json
POST /api/jobs
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "service_category": "drywall",
  "address_id": "123e4567-e89b-12d3-a456-426614174000",
  "description": "Need to patch a hole in bedroom wall from removing old shelf. Hole is about 4 inches in diameter.",
  "photos": [
    "https://photos.us-iad-10.linodeobjects.com/customers/abc-123/quotes/temp_xyz-456/photo_1.jpg",
    "https://photos.us-iad-10.linodeobjects.com/customers/abc-123/quotes/temp_xyz-456/photo_2.jpg"
  ],
  "preferred_dates": ["2025-11-20", "2025-11-21"],
  "budget_min": 0,
  "budget_max": 300,
  "urgency": "normal",
  "source": "app",
  "status": "requested"
}
```

---

## Response Schema

### TypeScript Interface
```typescript
interface JobCreateResponse {
  job_id: string;                // UUID of created job
  status: string;                // Should be "requested"
  estimated_total: number;       // Estimated cost in dollars
  created_at: string;            // ISO datetime string
}
```

### Pydantic Model (Python)
```python
from pydantic import BaseModel
from datetime import datetime

class JobCreateResponse(BaseModel):
    job_id: str = Field(..., description="UUID of created job")
    status: str = Field(..., description="Current job status")
    estimated_total: float = Field(..., description="Estimated total cost")
    created_at: str = Field(..., description="ISO datetime of creation")

    class Config:
        json_schema_extra = {
            "example": {
                "job_id": "789e4567-e89b-12d3-a456-426614174999",
                "status": "requested",
                "estimated_total": 275.50,
                "created_at": "2025-11-16T10:30:00Z"
            }
        }
```

### Example Response
```json
HTTP/1.1 201 Created
Content-Type: application/json

{
  "job_id": "789e4567-e89b-12d3-a456-426614174999",
  "status": "requested",
  "estimated_total": 275.50,
  "created_at": "2025-11-16T10:30:00Z"
}
```

---

## Implementation Steps

### 1. Add Route Handler (backend/server.py)
```python
from fastapi import APIRouter, Depends, HTTPException
from models.job import JobCreateRequest, JobCreateResponse
from auth.auth_handler import get_current_user_dependency
from datetime import datetime
import uuid

api_router = APIRouter(prefix="/api")

@api_router.post("/jobs", response_model=JobCreateResponse, status_code=201)
async def create_job(
    job_data: JobCreateRequest,
    current_user = Depends(get_current_user_dependency)
):
    """
    Create a new job request from a customer.

    - Validates job data
    - Creates job record in MongoDB
    - Calculates estimated total
    - Triggers notifications
    - Returns job details
    """

    # Validate user is a customer
    if current_user.role != "CUSTOMER":
        raise HTTPException(status_code=403, detail="Only customers can create jobs")

    # Validate address belongs to customer
    address = await db.addresses.find_one({
        "_id": job_data.address_id,
        "user_id": current_user.id
    })
    if not address:
        raise HTTPException(status_code=404, detail="Address not found")

    # Generate job ID
    job_id = str(uuid.uuid4())

    # Calculate estimated total (use existing pricing engine or simple calculation)
    estimated_total = calculate_estimate(job_data)

    # Create job document
    job_document = {
        "job_id": job_id,
        "customer_id": current_user.id,
        "contractor_id": None,  # Not assigned yet
        "address_id": job_data.address_id,
        "service_category": job_data.service_category,
        "description": job_data.description,
        "photos": job_data.photos,
        "preferred_dates": job_data.preferred_dates,
        "budget_min": job_data.budget_min,
        "budget_max": job_data.budget_max,
        "urgency": job_data.urgency,
        "source": job_data.source,
        "status": "requested",
        "estimated_total": estimated_total,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow(),
        # Additional tracking fields (for future)
        "distance_miles": None,
        "time_on_site_minutes": None,
        "materials_cost": None,
        "contractor_invoice_amount": None,
    }

    # Insert into MongoDB
    result = await db.jobs.insert_one(job_document)

    # Trigger notifications (async, don't block response)
    asyncio.create_task(send_job_notifications(job_id, current_user, job_data))

    # Return response
    return JobCreateResponse(
        job_id=job_id,
        status="requested",
        estimated_total=estimated_total,
        created_at=job_document["created_at"].isoformat()
    )
```

### 2. Add Estimation Logic
```python
def calculate_estimate(job_data: JobCreateRequest) -> float:
    """
    Calculate estimated total cost for job.

    Can use existing PricingEngine or simple heuristics.
    """
    # Option 1: Use existing pricing engine
    from services.pricing_engine import PricingEngine
    pricing_engine = PricingEngine()
    estimate = pricing_engine.calculate_for_job(job_data)
    return estimate.total

    # Option 2: Simple calculation based on category and budget
    if job_data.budget_max > 0:
        return job_data.budget_max * 0.9  # 90% of max budget
    else:
        # Default estimates by category
        category_estimates = {
            "drywall": 200,
            "painting": 300,
            "electrical": 250,
            "plumbing": 275,
            "carpentry": 225,
            "hvac": 350,
            "flooring": 400,
            "roofing": 500,
            "landscaping": 300,
            "appliance": 200,
            "windows": 250,
            "miscellaneous": 150,
        }
        return category_estimates.get(job_data.service_category, 200)
```

### 3. Add Notification Logic
```python
async def send_job_notifications(job_id: str, customer, job_data: JobCreateRequest):
    """
    Send notifications for new job creation.

    - Email to customer (confirmation)
    - SMS to customer (optional)
    - Email to admin (new job alert)
    """
    try:
        # Email to customer
        if email_provider:
            await email_provider.send_job_created_confirmation(
                to_email=customer.email,
                customer_name=customer.first_name,
                job_id=job_id,
                service_category=job_data.service_category,
                description=job_data.description,
                estimated_total=job_data.budget_max or 0
            )

        # SMS to customer (optional)
        if sms_provider and customer.phone:
            message = (
                f"We got your request for {job_data.service_category}. "
                f"Est: ${job_data.budget_max}. "
                f"We'll follow up soon. -The Real Johnson"
            )
            await sms_provider.send_sms(customer.phone, message)

        # Email to admin
        if email_provider:
            await email_provider.send_admin_job_alert(
                job_id=job_id,
                customer_name=f"{customer.first_name} {customer.last_name}",
                service_category=job_data.service_category,
                description=job_data.description,
                budget_max=job_data.budget_max,
                urgency=job_data.urgency,
                photos=job_data.photos
            )
    except Exception as e:
        # Log error but don't fail job creation
        print(f"Error sending notifications for job {job_id}: {e}")
```

### 4. Add to MongoDB (if not exists)
```python
# Jobs collection already exists (see CLAUDE.md)
# Ensure indexes are created:

await db.jobs.create_index([("contractor_id", 1), ("status", 1)])
await db.jobs.create_index([("customer_id", 1), ("created_at", -1)])
await db.jobs.create_index([("status", 1), ("scheduled_date", 1)])
await db.jobs.create_index([("created_at", -1)])
```

---

## Validation Rules

### Required Fields
- `service_category` - Must be one of 12 valid categories
- `address_id` - Must exist in addresses collection and belong to current user
- `description` - Minimum 10 characters
- `urgency` - Must be "flexible", "normal", or "urgent"

### Optional Fields
- `photos` - Array of Linode URLs (can be empty)
- `preferred_dates` - Array of ISO date strings (can be empty)
- `budget_min` - Default 0, must be >= 0
- `budget_max` - Default 0, must be >= 0

### Business Rules
- Only customers can create jobs (role check)
- Address must belong to customer (ownership check)
- Status always starts as "requested"
- Source defaults to "app"

---

## Error Responses

### 400 Bad Request - Invalid Data
```json
{
  "detail": "Validation error: description must be at least 10 characters"
}
```

### 401 Unauthorized - No Token
```json
{
  "detail": "Not authenticated"
}
```

### 403 Forbidden - Wrong Role
```json
{
  "detail": "Only customers can create jobs"
}
```

### 404 Not Found - Invalid Address
```json
{
  "detail": "Address not found"
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error"
}
```

---

## Testing Checklist

### Unit Tests
- [ ] Validate request with all required fields
- [ ] Validate request with optional fields
- [ ] Reject request with missing required fields
- [ ] Reject request with invalid service_category
- [ ] Reject request with invalid urgency
- [ ] Reject request with negative budget
- [ ] Reject request with description < 10 chars

### Integration Tests
- [ ] Create job with valid customer token
- [ ] Reject job creation with contractor token
- [ ] Reject job creation with admin token
- [ ] Reject job creation with non-existent address
- [ ] Reject job creation with address belonging to different user
- [ ] Verify job saved to MongoDB with correct fields
- [ ] Verify job_id is valid UUID
- [ ] Verify created_at is valid ISO datetime
- [ ] Verify estimated_total is calculated correctly

### Notification Tests
- [ ] Verify customer confirmation email sent
- [ ] Verify customer SMS sent (if phone exists)
- [ ] Verify admin alert email sent
- [ ] Verify notifications don't block job creation response
- [ ] Verify notification failures are logged but don't fail endpoint

### End-to-End Tests
- [ ] Frontend creates job successfully
- [ ] Job appears in customer's job list
- [ ] Job appears in contractor's available jobs
- [ ] Job has correct status, service_category, description
- [ ] Photos URLs are stored correctly
- [ ] Address data is accessible via address_id

---

## MongoDB Document Example

```javascript
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "job_id": "789e4567-e89b-12d3-a456-426614174999",
  "customer_id": "123e4567-e89b-12d3-a456-426614174000",
  "contractor_id": null,
  "address_id": "456e4567-e89b-12d3-a456-426614174001",
  "service_category": "drywall",
  "description": "Need to patch a hole in bedroom wall from removing old shelf. Hole is about 4 inches in diameter.",
  "photos": [
    "https://photos.us-iad-10.linodeobjects.com/customers/abc-123/quotes/temp_xyz-456/photo_1.jpg",
    "https://photos.us-iad-10.linodeobjects.com/customers/abc-123/quotes/temp_xyz-456/photo_2.jpg"
  ],
  "preferred_dates": ["2025-11-20", "2025-11-21"],
  "budget_min": 0,
  "budget_max": 300,
  "urgency": "normal",
  "source": "app",
  "status": "requested",
  "estimated_total": 275.50,
  "created_at": ISODate("2025-11-16T10:30:00Z"),
  "updated_at": ISODate("2025-11-16T10:30:00Z"),

  // Contractor tracking fields (null until job progresses)
  "distance_miles": null,
  "time_on_site_minutes": null,
  "materials_cost": null,
  "contractor_invoice_amount": null,
  "contractor_start_odometer": null,
  "contractor_end_odometer": null,
  "contractor_clock_in": null,
  "contractor_clock_out": null,
  "materials": [],

  // Workflow tracking (future)
  "claimed_at": null,
  "scheduled_date": null,
  "started_at": null,
  "completed_at": null,
  "cancelled_at": null,
  "cancellation_reason": null
}
```

---

## Status Workflow (Future Reference)

```
requested → claimed → scheduled → in_progress → completed
    ↓           ↓          ↓            ↓
cancelled   cancelled  cancelled    cancelled
```

**Status Transitions:**
- `requested` - Initial status when customer creates job
- `claimed` - Contractor accepts job
- `scheduled` - Date/time confirmed
- `in_progress` - Contractor starts work
- `completed` - Job finished
- `cancelled` - Job cancelled (can happen at any stage)

---

## Performance Considerations

### Expected Load
- 10-50 jobs per day initially
- Response time target: < 500ms
- Database writes: 1 insert per request

### Optimization Strategies
- Use async MongoDB operations
- Send notifications asynchronously (don't block response)
- Cache service category estimates
- Index on customer_id and created_at for fast queries

### Monitoring
- Log job creation events
- Track response times
- Monitor notification failures
- Alert on error rate > 5%

---

## Security Considerations

### Authentication
- Require valid JWT token
- Verify token hasn't expired
- Check user role is CUSTOMER

### Authorization
- Verify address_id belongs to current user
- Prevent creating jobs for other users
- Rate limit: max 10 jobs per customer per day

### Input Validation
- Sanitize description (no script tags)
- Validate photo URLs are from Linode domain
- Limit photos array to max 10 items
- Validate dates are in future

### Data Protection
- Don't expose internal IDs
- Don't return sensitive customer data
- Log access for audit trail

---

## Deployment Checklist

### Pre-Deployment
- [ ] Code review completed
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] Notification templates created
- [ ] MongoDB indexes created
- [ ] Error handling tested

### Deployment
- [ ] Deploy to staging environment
- [ ] Test with frontend on staging
- [ ] Verify notifications work
- [ ] Load test with 100 concurrent requests
- [ ] Deploy to production
- [ ] Smoke test production endpoint

### Post-Deployment
- [ ] Monitor error logs for 24 hours
- [ ] Verify jobs are created correctly
- [ ] Verify notifications are sent
- [ ] Check database for data integrity
- [ ] Update API documentation

---

## Support & Debugging

### Common Issues

**Issue: "Address not found"**
- Cause: address_id doesn't exist or belongs to different user
- Solution: Check addresses collection, verify ownership

**Issue: "Validation error"**
- Cause: Invalid service_category or urgency
- Solution: Check frontend is sending valid values

**Issue: Notifications not sent**
- Cause: Email/SMS provider not configured
- Solution: Check providers.env, verify API keys

**Issue: Estimated total is 0**
- Cause: Calculation logic not working
- Solution: Check pricing engine, verify service_category

### Logging
```python
import logging

logger = logging.getLogger(__name__)

@api_router.post("/jobs")
async def create_job(...):
    logger.info(f"Creating job for customer {current_user.id}")
    logger.debug(f"Job data: {job_data}")

    try:
        # ... create job ...
        logger.info(f"Job created successfully: {job_id}")
    except Exception as e:
        logger.error(f"Failed to create job: {e}", exc_info=True)
        raise
```

---

## Related Documentation

- See `CLAUDE.md` for full project context
- See `JOBS_TRANSFORMATION_SUMMARY.md` for frontend changes
- See `JOBS_VISUAL_COMPARISON.md` for before/after comparison
- See `backend/models/job.py` for Job model (if exists)
- See `backend/services/pricing_engine.py` for pricing logic

---

**Document Version**: 1.0
**Last Updated**: 2025-11-16
**Author**: Claude (Frontend Design Agent)
**Status**: Ready for Implementation

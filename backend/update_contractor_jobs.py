#!/usr/bin/env python3
"""
Script to replace get_available_jobs function to include both quotes and jobs
"""

NEW_FUNCTION = '''@api_router.get("/contractor/jobs/available")
async def get_available_jobs(
    current_user: User = Depends(get_current_user_dependency)
):
    """
    Get available work within 50-mile radius for contractor.

    Returns BOTH:
    - Unaccepted quotes (status="sent") - contractors can bid
    - Accepted jobs (no contractor assigned) - contractors can accept

    Filtered by skills and distance.
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

    from geopy.distance import geodesic
    available_items = []

    # === PART 1: Get unaccepted quotes (customers waiting for bids) ===
    quotes_cursor = db.quotes.find({"status": "sent"})

    async for quote_doc in quotes_cursor:
        # Get customer address for this quote
        customer = await db.users.find_one({"id": quote_doc["customer_id"]})
        if not customer or not customer.get("addresses"):
            continue

        quote_address = next(
            (addr for addr in customer["addresses"] if addr["id"] == quote_doc["address_id"]),
            None
        )

        if not quote_address or not quote_address.get("latitude") or not quote_address.get("longitude"):
            continue

        # Calculate distance
        quote_location = (quote_address["latitude"], quote_address["longitude"])
        distance = geodesic(contractor_location, quote_location).miles

        # Only include within radius and matching skills
        if distance <= MAX_DISTANCE_MILES:
            service_category = quote_doc.get("service_category", "")
            if service_category in current_user.specialties:
                quote_doc["item_type"] = "quote"
                quote_doc["distance_miles"] = round(distance, 2)
                quote_doc["customer_address"] = {
                    "city": quote_address.get("city", ""),
                    "state": quote_address.get("state", ""),
                    "zip_code": quote_address.get("zip_code", "")
                }
                quote_doc["price"] = quote_doc.get("total_amount", 0)
                quote_doc["title"] = quote_doc.get("description", "")
                quote_doc["category"] = service_category
                quote_doc["urgency"] = quote_doc.get("urgency", "normal")
                available_items.append(quote_doc)

    # === PART 2: Get jobs without contractors (accepted quotes) ===
    pending_jobs_cursor = db.jobs.find({
        "$or": [
            {"contractor_id": None},
            {"contractor_id": {"$exists": False}}
        ],
        "status": "pending"
    })

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

        # Only include within radius and matching skills
        if distance <= MAX_DISTANCE_MILES:
            service_category = job_doc.get("service_category", "")
            if service_category in current_user.specialties:
                job_doc["item_type"] = "job"
                job_doc["distance_miles"] = round(distance, 2)
                job_doc["customer_address"] = {
                    "city": job_address.get("city", ""),
                    "state": job_address.get("state", ""),
                    "zip_code": job_address.get("zip_code", "")
                }
                job_doc["price"] = job_doc.get("agreed_amount", 0)
                job_doc["title"] = job_doc.get("description", "")
                job_doc["category"] = service_category
                job_doc["urgency"] = "normal"
                available_items.append(job_doc)

    # Sort by distance (closest first)
    available_items.sort(key=lambda x: x["distance_miles"])

    logger.info(
        f"Contractor {current_user.id} found {len(available_items)} "
        f"available items ({sum(1 for x in available_items if x['item_type'] == 'quote')} quotes, "
        f"{sum(1 for x in available_items if x['item_type'] == 'job')} jobs) within {MAX_DISTANCE_MILES} miles"
    )

    return {
        "jobs": available_items,
        "count": len(available_items),
        "max_distance_miles": MAX_DISTANCE_MILES,
        "contractor_location": {
            "city": business_address.city,
            "state": business_address.state
        }
    }
'''

import sys

SERVER_FILE = "/srv/app/Handyman-app/backend/server.py"

try:
    with open(SERVER_FILE, 'r') as f:
        content = f.read()

    # Find the start of get_available_jobs function
    start_marker = '@api_router.get("/contractor/jobs/available")'
    start_idx = content.find(start_marker)

    if start_idx == -1:
        print("ERROR: Could not find get_available_jobs endpoint")
        sys.exit(1)

    # Find the end of this function (next @api_router or # === comment)
    search_from = start_idx + len(start_marker)

    # Look for next function or major section marker
    next_api = content.find('@api_router', search_from)
    next_section = content.find('# ====', search_from)

    end_idx = min(x for x in [next_api, next_section] if x > 0)

    if end_idx == -1:
        print("ERROR: Could not find end of function")
        sys.exit(1)

    # Replace the function
    new_content = content[:start_idx] + NEW_FUNCTION + '\n\n' + content[end_idx:]

    with open(SERVER_FILE, 'w') as f:
        f.write(new_content)

    print(f"✅ Successfully replaced get_available_jobs function")
    print(f"   Removed {end_idx - start_idx} chars, added {len(NEW_FUNCTION)} chars")

except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

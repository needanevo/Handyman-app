#!/usr/bin/env python3
"""
Add distance and category filter parameters to get_available_jobs endpoint
"""

import sys

SERVER_FILE = "/srv/app/Handyman-app/backend/server.py"

try:
    with open(SERVER_FILE, 'r') as f:
        content = f.read()

    # Find the get_available_jobs function definition
    old_function_def = '''@api_router.get("/contractor/jobs/available")
async def get_available_jobs(
    current_user: User = Depends(get_current_user_dependency)
):'''

    new_function_def = '''@api_router.get("/contractor/jobs/available")
async def get_available_jobs(
    max_distance: int = 50,
    category: Optional[str] = None,
    current_user: User = Depends(get_current_user_dependency)
):'''

    if old_function_def in content:
        content = content.replace(old_function_def, new_function_def)
        print("✅ Added filter parameters to function definition")
    else:
        print("⚠️  Function definition not found or already updated")

    # Update the MAX_DISTANCE_MILES line to use the parameter
    old_max_distance = '''    contractor_location = (business_address.latitude, business_address.longitude)
    MAX_DISTANCE_MILES = 50'''

    new_max_distance = '''    contractor_location = (business_address.latitude, business_address.longitude)
    MAX_DISTANCE_MILES = max_distance  # Use parameter, default 50'''

    if old_max_distance in content:
        content = content.replace(old_max_distance, new_max_distance)
        print("✅ Updated MAX_DISTANCE_MILES to use parameter")
    else:
        print("⚠️  MAX_DISTANCE_MILES assignment not found or already updated")

    # Add category filtering for quotes
    old_quote_filter = '''            # Show all jobs if no specialties (willing to do anything), or if specialty matches
            if not current_user.specialties or service_category in current_user.specialties:
                quote_doc["item_type"] = "quote"'''

    new_quote_filter = '''            # Show all jobs if no specialties (willing to do anything), or if specialty matches
            specialty_match = not current_user.specialties or service_category in current_user.specialties
            # Apply category filter if provided
            category_match = not category or service_category == category
            if specialty_match and category_match:
                quote_doc["item_type"] = "quote"'''

    if old_quote_filter in content:
        content = content.replace(old_quote_filter, new_quote_filter)
        print("✅ Added category filtering for quotes")
    else:
        print("⚠️  Quote filtering not found or already updated")

    # Add category filtering for jobs
    old_job_filter = '''            # Show all jobs if no specialties (willing to do anything), or if specialty matches
            if not current_user.specialties or service_category in current_user.specialties:
                job_doc["item_type"] = "job"'''

    new_job_filter = '''            # Show all jobs if no specialties (willing to do anything), or if specialty matches
            specialty_match = not current_user.specialties or service_category in current_user.specialties
            # Apply category filter if provided
            category_match = not category or service_category == category
            if specialty_match and category_match:
                job_doc["item_type"] = "job"'''

    if old_job_filter in content:
        content = content.replace(old_job_filter, new_job_filter)
        print("✅ Added category filtering for jobs")
    else:
        print("⚠️  Job filtering not found or already updated")

    # Write updated content
    with open(SERVER_FILE, 'w') as f:
        f.write(content)

    print(f"\n✅ Successfully updated {SERVER_FILE}")
    print("Changes:")
    print("  1. Added max_distance parameter (default: 50 miles)")
    print("  2. Added category filter parameter (optional)")
    print("  3. Backend now respects distance and category filters from frontend")

except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

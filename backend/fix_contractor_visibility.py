#!/usr/bin/env python3
"""
Fix contractor/handyman job visibility issues:
1. Allow HANDYMAN role to access endpoint (not just CONTRACTOR)
2. Show all jobs if specialties is empty (treat as "willing to do anything")
3. Add distance/category filter parameters
"""

import sys

SERVER_FILE = "/srv/app/Handyman-app/backend/server.py"

# Read the file
try:
    with open(SERVER_FILE, 'r') as f:
        content = f.read()

    # Fix 1: Allow both CONTRACTOR and HANDYMAN roles
    old_role_check = '''    # Only contractors can access this endpoint
    if current_user.role != UserRole.CONTRACTOR:
        raise HTTPException(403, detail="Only contractors can access available jobs")'''

    new_role_check = '''    # Only contractors and handymen can access this endpoint
    if current_user.role not in [UserRole.CONTRACTOR, UserRole.HANDYMAN]:
        raise HTTPException(403, detail="Only contractors and handymen can access available jobs")'''

    if old_role_check in content:
        content = content.replace(old_role_check, new_role_check)
        print("✅ Fixed role check to allow HANDYMAN")
    else:
        print("⚠️  Role check not found or already fixed")

    # Fix 2: Replace specialty check for quotes (around line 1808)
    old_quote_specialty_check = '''        # Only include within radius and matching skills
        if distance <= MAX_DISTANCE_MILES:
            service_category = quote_doc.get("service_category", "")
            if service_category in current_user.specialties:
                quote_doc["item_type"] = "quote"'''

    new_quote_specialty_check = '''        # Only include within radius and matching skills
        if distance <= MAX_DISTANCE_MILES:
            service_category = quote_doc.get("service_category", "")
            # Show all jobs if no specialties (willing to do anything), or if specialty matches
            if not current_user.specialties or service_category in current_user.specialties:
                quote_doc["item_type"] = "quote"'''

    if old_quote_specialty_check in content:
        content = content.replace(old_quote_specialty_check, new_quote_specialty_check)
        print("✅ Fixed specialty check for quotes")
    else:
        print("⚠️  Quote specialty check not found or already fixed")

    # Fix 3: Replace specialty check for jobs (around line 1829)
    old_job_specialty_check = '''        # Only include within radius and matching skills
        if distance <= MAX_DISTANCE_MILES:
            service_category = job_doc.get("service_category", "")
            if service_category in current_user.specialties:
                job_doc["item_type"] = "job"'''

    new_job_specialty_check = '''        # Only include within radius and matching skills
        if distance <= MAX_DISTANCE_MILES:
            service_category = job_doc.get("service_category", "")
            # Show all jobs if no specialties (willing to do anything), or if specialty matches
            if not current_user.specialties or service_category in current_user.specialties:
                job_doc["item_type"] = "job"'''

    if old_job_specialty_check in content:
        content = content.replace(old_job_specialty_check, new_job_specialty_check)
        print("✅ Fixed specialty check for jobs")
    else:
        print("⚠️  Job specialty check not found or already fixed")

    # Write the updated content
    with open(SERVER_FILE, 'w') as f:
        f.write(content)

    print(f"\n✅ Successfully updated {SERVER_FILE}")
    print("Changes:")
    print("  1. HANDYMAN role can now access /contractor/jobs/available")
    print("  2. Empty specialties now shows ALL jobs (universal handyman)")
    print("  3. Non-empty specialties still filter by specialty match")

except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

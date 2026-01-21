#!/usr/bin/env python3
"""
Add onboarding step tracking endpoints for Phase 5B-1
"""

import sys

SERVER_FILE = "server.py"

NEW_ENDPOINTS = '''
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

'''

try:
    with open(SERVER_FILE, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find a good insertion point - after auth routes, before customer routes
    marker = '# ==================== CUSTOMER ROUTES ===================='

    if marker not in content:
        # Try alternative marker
        marker = '@api_router.post("/customers/verify-location")'

    if marker not in content:
        print("❌ Could not find insertion point")
        sys.exit(1)

    marker_pos = content.find(marker)

    # Insert the new endpoints before the marker
    new_content = content[:marker_pos] + NEW_ENDPOINTS + '\n' + content[marker_pos:]

    with open(SERVER_FILE, 'w', encoding='utf-8') as f:
        f.write(new_content)

    print("[OK] Successfully added onboarding tracking endpoints")
    print(f"   Inserted at position {marker_pos}")
    print("\nNew endpoints:")
    print("  POST /auth/onboarding/step - Save current step progress")
    print("  POST /auth/onboarding/complete - Mark onboarding as done")
    print("\nThese enable reload-safe onboarding (Phase 5B-1)")

except Exception as e:
    print(f"[ERROR] Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

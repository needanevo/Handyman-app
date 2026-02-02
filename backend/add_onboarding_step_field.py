#!/usr/bin/env python3
"""
Add onboarding_step field to User model for Phase 5B-1 completion
"""

import sys

USER_MODEL_FILE = "/srv/app/Handyman-app/backend/models/user.py"

try:
    with open(USER_MODEL_FILE, 'r') as f:
        content = f.read()

    # Find the location to add onboarding fields - after provider_completeness
    old_line = '''    provider_completeness: Optional[int] = 0  # Percentage 0-100
    specialties: List[str] = []  # Contractor-only specialties'''

    new_lines = '''    provider_completeness: Optional[int] = 0  # Percentage 0-100

    # Onboarding step tracking (Phase 5B-1)
    onboarding_step: Optional[int] = None  # Current step in registration (1-5), None if complete
    onboarding_completed: bool = False  # Whether onboarding is fully complete

    specialties: List[str] = []  # Contractor-only specialties'''

    if old_line in content:
        content = content.replace(old_line, new_lines)
        print("✅ Added onboarding_step and onboarding_completed fields to User model")
    else:
        print("⚠️  Could not find insertion point or fields already exist")

    # Write updated content
    with open(USER_MODEL_FILE, 'w') as f:
        f.write(content)

    print(f"\n✅ Successfully updated {USER_MODEL_FILE}")
    print("Changes:")
    print("  1. Added onboarding_step: Optional[int] - tracks current registration step (1-5)")
    print("  2. Added onboarding_completed: bool - marks when registration is fully done")
    print("\nThese fields enable reload-safe onboarding (Phase 5B-1 requirement)")

except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

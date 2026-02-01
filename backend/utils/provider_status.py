"""
Provider Status Lifecycle (Phase 5B-2)

Status flow: draft → submitted → active + restricted (non-destructive)

- draft: Provider just registered, profile incomplete
- submitted: Provider completed onboarding, awaiting auto-activation
- active: Completeness >= threshold, can accept jobs
- restricted: Address verification expired or admin action
"""

from datetime import datetime
from .provider_completeness import compute_completeness

ACTIVE_THRESHOLD = 80  # Minimum completeness % to become active


def compute_provider_status(user_data: dict) -> str:
    """
    Compute the correct provider status based on current user data.
    Does NOT write to DB — caller is responsible for persisting.

    Returns one of: "draft", "submitted", "active", "restricted"
    """
    role = user_data.get("role", "")
    if role not in ("handyman", "technician"):
        return "draft"

    current_status = user_data.get("provider_status", "draft") or "draft"

    # If already restricted, check if they can recover
    if current_status == "restricted":
        if _can_recover_from_restricted(user_data):
            return "active"
        return "restricted"

    completeness = compute_completeness(user_data)

    # Check address verification deadline
    if _is_address_verification_expired(user_data):
        return "restricted"

    # Auto-activate if completeness meets threshold
    if completeness >= ACTIVE_THRESHOLD:
        return "active"

    # If they've started filling out profile, mark as submitted
    if completeness > 0 and current_status == "draft":
        return "submitted"

    # If already submitted but below threshold, stay submitted
    if current_status == "submitted":
        return "submitted"

    return "draft"


def _is_address_verification_expired(user_data: dict) -> bool:
    """Check if the 10-day address verification window has passed."""
    deadline = user_data.get("address_verification_deadline")
    if not deadline:
        return False

    verification_status = user_data.get("address_verification_status", "pending")
    if verification_status == "verified":
        return False

    if isinstance(deadline, str):
        try:
            deadline = datetime.fromisoformat(deadline)
        except (ValueError, TypeError):
            return False

    return datetime.utcnow() > deadline


def _can_recover_from_restricted(user_data: dict) -> bool:
    """
    Check if a restricted provider has resolved their issues
    and can return to active status.
    """
    # Must have verified address
    if user_data.get("address_verification_status") != "verified":
        return False

    # Must meet completeness threshold
    completeness = compute_completeness(user_data)
    if completeness < ACTIVE_THRESHOLD:
        return False

    return True


def can_accept_jobs(user_data: dict) -> tuple[bool, str]:
    """
    Central gate: can this provider accept/bid on jobs?

    Returns:
        (allowed: bool, reason: str)
    """
    role = user_data.get("role", "")
    if role not in ("handyman", "technician"):
        return False, "Only providers can accept jobs"

    status = user_data.get("provider_status", "draft") or "draft"

    if status == "active":
        return True, ""

    if status == "restricted":
        return False, "Your account is restricted. Please verify your address to continue."

    if status == "submitted":
        return False, "Your profile is under review. Complete all required fields to get activated."

    # draft
    return False, "Complete your profile to start accepting jobs."

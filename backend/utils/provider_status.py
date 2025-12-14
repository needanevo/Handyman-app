"""
Provider status transition logic.
Handles draft → active, active → restricted, restricted → active transitions.
"""
from typing import Dict, Any
from datetime import datetime


# Completeness threshold for draft → active transition
ACTIVE_THRESHOLD = 80  # 80% completeness required


def should_transition_to_active(
    current_status: str,
    completeness: int,
    address_verified: bool = False
) -> bool:
    """
    Determine if provider should transition from draft to active.

    Args:
        current_status: Current provider_status
        completeness: Current provider_completeness percentage
        address_verified: Whether address is verified (optional check)

    Returns:
        True if should transition to active
    """
    # Only transition from draft
    if current_status != "draft":
        return False

    # Must meet completeness threshold
    if completeness < ACTIVE_THRESHOLD:
        return False

    # All conditions met
    return True


def should_transition_to_restricted(
    current_status: str,
    deadline_exceeded: bool = False,
    violation_occurred: bool = False
) -> bool:
    """
    Determine if provider should transition to restricted.

    Args:
        current_status: Current provider_status
        deadline_exceeded: Whether address verification deadline exceeded
        violation_occurred: Whether a policy violation occurred

    Returns:
        True if should transition to restricted
    """
    # Can only restrict active providers
    if current_status != "active":
        return False

    # Restrict if deadline exceeded or violation occurred
    if deadline_exceeded or violation_occurred:
        return True

    return False


def should_transition_to_active_from_restricted(
    current_status: str,
    deadline_exceeded: bool = False,
    violation_resolved: bool = True
) -> bool:
    """
    Determine if provider should recover from restricted to active.

    Args:
        current_status: Current provider_status
        deadline_exceeded: Whether address verification deadline still exceeded
        violation_resolved: Whether the violation has been resolved

    Returns:
        True if should transition back to active
    """
    # Can only recover from restricted
    if current_status != "restricted":
        return False

    # Cannot recover if deadline still exceeded
    if deadline_exceeded:
        return False

    # Can recover if violation resolved
    if violation_resolved:
        return True

    return False


def compute_new_status(
    current_status: str,
    completeness: int,
    address_verification_status: str = "pending",
    address_verification_deadline: str = None
) -> str:
    """
    Compute new provider_status based on current state.

    Args:
        current_status: Current provider_status
        completeness: Current provider_completeness percentage
        address_verification_status: Current address verification status
        address_verification_deadline: ISO datetime string for deadline

    Returns:
        New provider_status (may be same as current)
    """
    # Check if address verification deadline exceeded
    deadline_exceeded = False
    if address_verification_deadline:
        try:
            deadline_dt = datetime.fromisoformat(address_verification_deadline)
            if datetime.utcnow() > deadline_dt:
                deadline_exceeded = True
        except (ValueError, TypeError):
            pass

    # Check for draft → active transition
    if should_transition_to_active(current_status, completeness):
        return "active"

    # Check for active → restricted (deadline exceeded)
    if should_transition_to_restricted(current_status, deadline_exceeded=deadline_exceeded):
        return "restricted"

    # Check for restricted → active recovery
    if should_transition_to_active_from_restricted(
        current_status,
        deadline_exceeded=deadline_exceeded,
        violation_resolved=(address_verification_status == "verified")
    ):
        return "active"

    # No transition - keep current status
    return current_status

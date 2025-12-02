"""
Provider Type Kill Switch

Controls which provider types (licensed contractors vs unlicensed handymen)
are allowed to register and access the platform.

Environment Variable: ALLOWED_PROVIDER_TYPES
- "both" (default): Allow both licensed contractors and unlicensed handymen
- "licensed_only": Only allow licensed contractors (TECHNICIAN role)
- "handyman_only": Only allow unlicensed handymen (HANDYMAN role)
- "contractors_disabled": Disable new contractor registrations (maintenance mode)
"""

import os
from enum import Enum
from fastapi import HTTPException
from typing import Optional


class ProviderType(str, Enum):
    LICENSED_CONTRACTOR = "licensed"  # UserRole.TECHNICIAN
    UNLICENSED_HANDYMAN = "handyman"  # UserRole.HANDYMAN


class AllowedProviderTypes(str, Enum):
    BOTH = "both"
    LICENSED_ONLY = "licensed_only"
    HANDYMAN_ONLY = "handyman_only"
    CONTRACTORS_DISABLED = "contractors_disabled"


def get_allowed_provider_types() -> AllowedProviderTypes:
    """Get the current allowed provider types from environment"""
    setting = os.getenv("ALLOWED_PROVIDER_TYPES", "both").lower()

    try:
        return AllowedProviderTypes(setting)
    except ValueError:
        # Default to "both" if invalid value
        return AllowedProviderTypes.BOTH


def is_provider_type_allowed(provider_type: ProviderType) -> bool:
    """
    Check if a provider type is currently allowed to register

    Args:
        provider_type: The type of provider (licensed or handyman)

    Returns:
        bool: True if allowed, False if blocked
    """
    allowed = get_allowed_provider_types()

    if allowed == AllowedProviderTypes.BOTH:
        return True

    if allowed == AllowedProviderTypes.CONTRACTORS_DISABLED:
        return False

    if allowed == AllowedProviderTypes.LICENSED_ONLY:
        return provider_type == ProviderType.LICENSED_CONTRACTOR

    if allowed == AllowedProviderTypes.HANDYMAN_ONLY:
        return provider_type == ProviderType.UNLICENSED_HANDYMAN

    return False


def check_provider_type_gate(provider_type: ProviderType):
    """
    Gate function for FastAPI routes. Raises HTTPException if provider type not allowed.

    Args:
        provider_type: The type of provider trying to access the route

    Raises:
        HTTPException: 403 if provider type is not allowed
    """
    if not is_provider_type_allowed(provider_type):
        allowed = get_allowed_provider_types()

        if allowed == AllowedProviderTypes.CONTRACTORS_DISABLED:
            raise HTTPException(
                status_code=503,
                detail="New contractor registrations are temporarily disabled. Please check back later."
            )

        if allowed == AllowedProviderTypes.LICENSED_ONLY:
            raise HTTPException(
                status_code=403,
                detail="Only licensed contractors are currently allowed to register."
            )

        if allowed == AllowedProviderTypes.HANDYMAN_ONLY:
            raise HTTPException(
                status_code=403,
                detail="Only handymen are currently allowed to register."
            )

        # Default error
        raise HTTPException(
            status_code=403,
            detail="This provider type is not currently allowed to register."
        )


def get_provider_gate_status() -> dict:
    """
    Get current status of provider gates (for admin dashboard)

    Returns:
        dict: Status of each provider type
    """
    allowed = get_allowed_provider_types()

    return {
        "allowed_provider_types": allowed.value,
        "licensed_contractors_allowed": is_provider_type_allowed(ProviderType.LICENSED_CONTRACTOR),
        "unlicensed_handymen_allowed": is_provider_type_allowed(ProviderType.UNLICENSED_HANDYMAN),
        "registrations_open": allowed != AllowedProviderTypes.CONTRACTORS_DISABLED
    }

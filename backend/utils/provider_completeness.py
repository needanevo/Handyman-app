"""
Provider completeness scoring utility.
Computes provider_completeness percentage (0-100) based on filled fields.
"""
from typing import Dict, Any


def compute_handyman_completeness(user_data: Dict[str, Any]) -> int:
    """
    Compute completeness percentage for handyman.

    Required fields (100% total):
    - Basic info (20%): email, phone, first_name, last_name
    - Skills (25%): at least one skill
    - Address (20%): at least one address
    - Experience (15%): years_experience
    - Provider intent (10%): provider_intent set
    - Provider type (10%): provider_type set

    Returns:
        Integer percentage 0-100
    """
    score = 0

    # Basic info (20%)
    if user_data.get('email') and user_data.get('phone'):
        score += 10
    if user_data.get('first_name') and user_data.get('last_name'):
        score += 10

    # Skills (25%)
    skills = user_data.get('skills', [])
    if skills and len(skills) > 0:
        score += 25

    # Address (20%)
    addresses = user_data.get('addresses', [])
    if addresses and len(addresses) > 0:
        score += 20

    # Experience (15%)
    if user_data.get('years_experience') is not None:
        score += 15

    # Provider intent (10%)
    if user_data.get('provider_intent'):
        score += 10

    # Provider type (10%)
    if user_data.get('provider_type'):
        score += 10

    return min(score, 100)


def compute_contractor_completeness(user_data: Dict[str, Any]) -> int:
    """
    Compute completeness percentage for contractor.

    Required fields (100% total):
    - Basic info (15%): email, phone, first_name, last_name
    - Business name (10%): business_name
    - Documents (25%): profile_photo + license
    - Skills (15%): at least one skill
    - Address (15%): at least one address
    - Experience (10%): years_experience
    - Provider intent (5%): provider_intent set
    - Provider type (5%): provider_type set

    Returns:
        Integer percentage 0-100
    """
    score = 0

    # Basic info (15%)
    if user_data.get('email') and user_data.get('phone'):
        score += 7
    if user_data.get('first_name') and user_data.get('last_name'):
        score += 8

    # Business name (10%)
    if user_data.get('business_name'):
        score += 10

    # Documents (25%)
    if user_data.get('profile_photo'):
        score += 10
    documents = user_data.get('documents', {})
    if documents and documents.get('license'):
        score += 15

    # Skills (15%)
    skills = user_data.get('skills', [])
    if skills and len(skills) > 0:
        score += 15

    # Address (15%)
    addresses = user_data.get('addresses', [])
    if addresses and len(addresses) > 0:
        score += 15

    # Experience (10%)
    if user_data.get('years_experience') is not None:
        score += 10

    # Provider intent (5%)
    if user_data.get('provider_intent'):
        score += 5

    # Provider type (5%)
    if user_data.get('provider_type'):
        score += 5

    return min(score, 100)


def compute_provider_completeness(user_data: Dict[str, Any]) -> int:
    """
    Compute completeness percentage based on user role.

    Args:
        user_data: Dictionary containing user fields

    Returns:
        Integer percentage 0-100
    """
    role = user_data.get('role')

    if role == 'handyman':
        return compute_handyman_completeness(user_data)
    elif role == 'contractor':
        return compute_contractor_completeness(user_data)
    else:
        # Customers and admins don't have completeness scoring
        return 0

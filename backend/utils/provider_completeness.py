"""
Provider Completeness Scoring (Phase 5B-2)

Role-aware scoring that computes how complete a provider's profile is.
Used to gate job acceptance and drive onboarding UI.
"""


def compute_handyman_completeness(user_data: dict) -> int:
    """
    Compute completeness percentage for handyman profiles.

    Weights:
      - profile_photo: 15%
      - skills: 15%
      - addresses (at least one): 15%
      - phone: 10%
      - years_experience: 10%
      - service_areas: 10%
      - hourly_rate: 10%
      - documents (driver's license): 15%
    """
    score = 0

    if user_data.get("profile_photo"):
        score += 15
    if user_data.get("skills") and len(user_data["skills"]) > 0:
        score += 15
    if user_data.get("addresses") and len(user_data["addresses"]) > 0:
        score += 15
    if user_data.get("phone"):
        score += 10
    if user_data.get("years_experience") is not None:
        score += 10
    if user_data.get("service_areas") and len(user_data["service_areas"]) > 0:
        score += 10
    if user_data.get("hourly_rate") is not None:
        score += 10
    docs = user_data.get("documents") or {}
    if docs.get("license"):
        score += 15

    return min(score, 100)


def compute_contractor_completeness(user_data: dict) -> int:
    """
    Compute completeness percentage for licensed contractor profiles.

    Weights:
      - profile_photo: 10%
      - skills: 10%
      - addresses (at least one): 10%
      - phone: 5%
      - years_experience: 5%
      - service_areas: 10%
      - hourly_rate: 5%
      - documents (driver's license): 10%
      - license_number: 15%
      - is_insured / insurance docs: 10%
      - business_name: 10%
    """
    score = 0

    if user_data.get("profile_photo"):
        score += 10
    if user_data.get("skills") and len(user_data["skills"]) > 0:
        score += 10
    if user_data.get("addresses") and len(user_data["addresses"]) > 0:
        score += 10
    if user_data.get("phone"):
        score += 5
    if user_data.get("years_experience") is not None:
        score += 5
    if user_data.get("service_areas") and len(user_data["service_areas"]) > 0:
        score += 10
    if user_data.get("hourly_rate") is not None:
        score += 5
    docs = user_data.get("documents") or {}
    if docs.get("license"):
        score += 10
    if user_data.get("license_number"):
        score += 15
    if user_data.get("is_insured") or docs.get("insurance"):
        score += 10
    if user_data.get("business_name"):
        score += 10

    return min(score, 100)


def compute_completeness(user_data: dict) -> int:
    """Compute completeness based on user role."""
    role = user_data.get("role", "")
    if role == "technician":
        return compute_contractor_completeness(user_data)
    elif role == "handyman":
        return compute_handyman_completeness(user_data)
    return 0

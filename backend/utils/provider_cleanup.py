"""
Provider inactivity auto-cleanup utility.
Marks long-term restricted providers as inactive (non-destructive).
"""
from datetime import datetime, timedelta
from typing import List, Dict, Any
import logging

logger = logging.getLogger(__name__)

# Inactivity threshold: providers restricted for this long become inactive
INACTIVITY_THRESHOLD_DAYS = 30


async def cleanup_inactive_providers(db) -> Dict[str, Any]:
    """
    Mark long-term restricted providers as inactive.
    Non-destructive - only updates is_active flag, no data deletion.

    Args:
        db: MongoDB database connection

    Returns:
        Dictionary with cleanup statistics
    """
    threshold_date = datetime.utcnow() - timedelta(days=INACTIVITY_THRESHOLD_DAYS)

    # Find providers who have been restricted for too long
    # We check if they've been restricted since before the threshold date
    # This is conservative - we only mark inactive if we're certain they've been restricted long enough
    query = {
        "role": {"$in": ["handyman", "contractor"]},
        "provider_status": "restricted",
        "is_active": True,
        # If there's a status_changed_at field, use it; otherwise fall back to updated_at
        "$or": [
            {"provider_status_changed_at": {"$lt": threshold_date.isoformat()}},
            {
                "$and": [
                    {"provider_status_changed_at": {"$exists": False}},
                    {"updated_at": {"$lt": threshold_date.isoformat()}}
                ]
            }
        ]
    }

    # Get count before cleanup
    inactive_candidates = await db.users.count_documents(query)

    if inactive_candidates == 0:
        logger.info("No providers eligible for inactivity cleanup")
        return {
            "checked_at": datetime.utcnow().isoformat(),
            "candidates_found": 0,
            "marked_inactive": 0,
            "details": []
        }

    # Mark providers as inactive (non-destructive)
    result = await db.users.update_many(
        query,
        {
            "$set": {
                "is_active": False,
                "inactivity_reason": f"Restricted for {INACTIVITY_THRESHOLD_DAYS}+ days",
                "marked_inactive_at": datetime.utcnow().isoformat()
            }
        }
    )

    # Get list of affected providers for logging
    affected_providers = await db.users.find(
        {
            "marked_inactive_at": {"$exists": True},
            "is_active": False,
            "provider_status": "restricted"
        },
        {"id": 1, "email": 1, "role": 1, "provider_status": 1}
    ).to_list(length=100)

    details = [
        {
            "id": p.get("id"),
            "email": p.get("email"),
            "role": p.get("role")
        }
        for p in affected_providers
    ]

    logger.info(
        f"Inactivity cleanup: marked {result.modified_count} providers inactive "
        f"(restricted for {INACTIVITY_THRESHOLD_DAYS}+ days)"
    )

    return {
        "checked_at": datetime.utcnow().isoformat(),
        "candidates_found": inactive_candidates,
        "marked_inactive": result.modified_count,
        "threshold_days": INACTIVITY_THRESHOLD_DAYS,
        "details": details
    }


async def restore_provider_activity(db, user_id: str) -> bool:
    """
    Restore a provider's active status (undo cleanup).
    Used when a previously inactive provider resolves their issues.

    Args:
        db: MongoDB database connection
        user_id: Provider user ID

    Returns:
        True if restored successfully
    """
    result = await db.users.update_one(
        {
            "id": user_id,
            "is_active": False,
            "inactivity_reason": {"$exists": True}
        },
        {
            "$set": {
                "is_active": True
            },
            "$unset": {
                "inactivity_reason": "",
                "marked_inactive_at": ""
            }
        }
    )

    if result.modified_count > 0:
        logger.info(f"Restored activity for provider {user_id}")
        return True

    return False

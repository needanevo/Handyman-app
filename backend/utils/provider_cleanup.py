"""
Provider Cleanup (Phase 5B-2)

Soft-delete approach for restricted + inactive providers.
- Restricted providers inactive > 30 days → soft delete (is_active=False, deleted_at set)
- MongoDB TTL index on deleted_at auto-removes after 30 more days

To run: call cleanup_inactive_providers(db) from a scheduled task or admin endpoint.
"""

from datetime import datetime, timedelta

INACTIVITY_THRESHOLD_DAYS = 30  # Days of restriction before soft-delete


async def cleanup_inactive_providers(db) -> dict:
    """
    Find restricted providers who have been inactive beyond the threshold
    and soft-delete them (set is_active=False + deleted_at).

    Returns summary of actions taken.
    """
    cutoff = datetime.utcnow() - timedelta(days=INACTIVITY_THRESHOLD_DAYS)
    results = {"checked": 0, "soft_deleted": 0, "errors": []}

    cursor = db.users.find({
        "role": {"$in": ["handyman", "technician"]},
        "provider_status": "restricted",
        "is_active": True,
        "deleted_at": None,
    })

    async for user in cursor:
        results["checked"] += 1

        # Check when they became restricted (use updated_at as proxy)
        updated_at = user.get("updated_at")
        if not updated_at or updated_at > cutoff:
            continue

        try:
            await db.users.update_one(
                {"_id": user["_id"]},
                {"$set": {
                    "is_active": False,
                    "deleted_at": datetime.utcnow(),
                    "inactivity_reason": f"Restricted for {INACTIVITY_THRESHOLD_DAYS}+ days without resolution",
                    "marked_inactive_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow(),
                }}
            )
            results["soft_deleted"] += 1
        except Exception as e:
            results["errors"].append({"user_id": user.get("id"), "error": str(e)})

    return results


async def restore_provider(db, user_id: str) -> bool:
    """
    Restore a soft-deleted provider back to draft status.
    Clears deleted_at so TTL index won't expire the record.
    """
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": {
            "is_active": True,
            "provider_status": "draft",
            "updated_at": datetime.utcnow(),
        }, "$unset": {
            "deleted_at": "",
            "inactivity_reason": "",
            "marked_inactive_at": "",
        }}
    )
    return result.modified_count > 0


async def ensure_ttl_index(db):
    """
    Create TTL index on deleted_at field.
    Documents with deleted_at set will be auto-removed after 30 days.
    Safe to call multiple times (MongoDB ignores duplicate index creation).
    """
    await db.users.create_index(
        "deleted_at",
        expireAfterSeconds=30 * 24 * 60 * 60,  # 30 days
        partialFilterExpression={"deleted_at": {"$type": "date"}},
        name="ttl_soft_delete_cleanup"
    )

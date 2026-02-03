#!/usr/bin/env python3
"""
Migration script to update job statuses from old values to new values.
Run this after deploying the new JobStatus enum.

Usage:
    python migrate_job_statuses.py
"""

from pymongo import MongoClient

# Use MongoDB Atlas (same as server)
MONGO_URL = "mongodb+srv://needanevo:$1Jennifer@cluster0.d5iqsxn.mongodb.net/?appName=Cluster0&w=majority&tlsAllowInvalidCertificates=true"
DB_NAME = "handyman"

print(f"Connecting to MongoDB Atlas...")
print(f"Database: {DB_NAME}")

client = MongoClient(MONGO_URL)
db = client[DB_NAME]

# Migration mappings
migrations = [
    {"old": "published", "new": "posted"},
    {"old": "scheduled", "new": "accepted"},
    {"old": "completed_pending_review", "new": "completed"},
    {"old": "cancelled_by_customer", "new": "cancelled_before_accept"},
    {"old": "cancelled_by_contractor", "new": "cancelled_after_accept"},
]

def run_migration():
    """Run all status migrations."""
    print("\n=== Before Migration ===")
    print("Status distribution:")
    for doc in db.jobs.aggregate([{'$group': {'_id': '$status', 'count': {'$sum': 1}}}]):
        print(f"  {doc['_id']}: {doc['count']}")

    total_updated = 0

    for migration in migrations:
        old_status = migration["old"]
        new_status = migration["new"]

        result = db.jobs.update_many(
            {"status": old_status},
            {"$set": {"status": new_status}}
        )

        if result.modified_count > 0:
            print(f"\nUpdated {result.modified_count} jobs from '{old_status}' to '{new_status}'")
            total_updated += result.modified_count

    if total_updated == 0:
        print("\nNo jobs needed updating.")

    print("\n=== After Migration ===")
    print("Status distribution:")
    for doc in db.jobs.aggregate([{'$group': {'_id': '$status', 'count': {'$sum': 1}}}]):
        print(f"  {doc['_id']}: {doc['count']}")

    return total_updated

if __name__ == "__main__":
    run_migration()
    print("\n✅ Migration complete!")

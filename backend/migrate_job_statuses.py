#!/usr/bin/env python3
"""
Migration script to update job statuses from old values to new values.
Run this after deploying the new JobStatus enum.

Usage:
    python migrate_job_statuses.py
"""

import os
from pymongo import MongoClient

# Load environment variables from server.py's config
mongo_url = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
db_name = os.environ.get("DB_NAME", "handyman")

print(f"Connecting to MongoDB: {mongo_url}")
print(f"Database: {db_name}")

client = MongoClient(mongo_url)
db = client[db_name]

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
    total_updated = 0
    
    for migration in migrations:
        old_status = migration["old"]
        new_status = migration["new"]
        
        result = db.jobs.update_many(
            {"status": old_status},
            {"$set": {"status": new_status}}
        )
        
        if result.modified_count > 0:
            print(f"Updated {result.modified_count} jobs from '{old_status}' to '{new_status}'")
            total_updated += result.modified_count
    
    # Also migrate quotes if they exist
    try:
        result = db.quotes.update_many(
            {"status": "pending"},
            {"$set": {"status": "posted"}}
        )
        if result.modified_count > 0:
            print(f"Updated {result.modified_count} quotes from 'pending' to 'posted'")
            total_updated += result.modified_count
    except Exception as e:
        print(f"Quotes migration skipped: {e}")
    
    return total_updated

def verify_migration():
    """Verify migration was successful."""
    print("\n--- Current job status distribution ---")
    pipeline = [
        {"$group": {"_id": "$status", "count": {"$sum": 1}}},
        {"$sort": {"_id": 1}}
    ]
    
    for doc in db.jobs.aggregate(pipeline):
        print(f"  {doc['_id']}: {doc['count']} jobs")
    
    print("\n--- Jobs with old status values (should be 0) ---")
    old_statuses = [m["old"] for m in migrations]
    count = db.jobs.count_documents({"status": {"$in": old_statuses}})
    print(f"Jobs with old statuses: {count}")
    
    return count == 0

if __name__ == "__main__":
    print("=" * 50)
    print("Job Status Migration Script")
    print("=" * 50)
    
    # Show current state
    print("\nBefore migration:")
    verify_migration()
    
    # Run migration
    print("\nRunning migration...")
    total = run_migration()
    print(f"\nTotal jobs updated: {total}")
    
    # Verify
    print("\nAfter migration:")
    success = verify_migration()
    
    if success:
        print("\n✅ Migration successful!")
    else:
        print("\n⚠️ Migration incomplete - some jobs still have old status values")
    
    client.close()

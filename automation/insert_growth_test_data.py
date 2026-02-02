"""
MongoDB Mock Data Script for Growth Unlock Testing

This script inserts 5 completed jobs for a test handyman user
to trigger the growth center unlock (requires 3+ completed jobs).

Usage:
    python automation/insert_growth_test_data.py
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from datetime import datetime, timedelta
import uuid
from dotenv import load_dotenv

# Load environment
load_dotenv("backend/providers/providers.env")

MONGO_URL = os.environ.get("MONGO_URL")
DB_NAME = os.environ.get("DB_NAME")

async def insert_test_data():
    """Insert test data for growth unlock testing"""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]

    # Test handyman user ID (replace with actual user ID after registration)
    handyman_id = "test-handyman-growth-unlock"
    handyman_email = "handyman.growth.test@example.com"

    print("=" * 60)
    print("GROWTH UNLOCK TEST DATA INSERTION")
    print("=" * 60)

    # 1. Check if test handyman exists, create if not
    existing_user = await db.users.find_one({"email": handyman_email})

    if not existing_user:
        print(f"\n1. Creating test handyman user: {handyman_email}")

        user_doc = {
            "id": handyman_id,
            "email": handyman_email,
            "phone": "555-GROWTH",
            "first_name": "Growth",
            "last_name": "Tester",
            "role": "handyman",
            "is_active": True,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
            "addresses": [],
            "skills": ["plumbing", "electrical", "carpentry"],
            "hourly_rate": 50.0,
            "service_areas": ["78701", "78702", "78703"]
        }

        await db.users.insert_one(user_doc)

        # Create password for test user
        from passlib.context import CryptContext
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        password_hash = pwd_context.hash("testpassword123")

        await db.user_passwords.insert_one({
            "user_id": handyman_id,
            "password_hash": password_hash,
            "created_at": datetime.utcnow()
        })

        print(f"   ✓ Created user: {handyman_email}")
        print(f"   ✓ Password: testpassword123")
    else:
        handyman_id = existing_user["id"]
        print(f"\n1. Using existing handyman: {handyman_email}")
        print(f"   User ID: {handyman_id}")

    # 2. Create test customer
    customer_id = "test-customer-growth-unlock"
    customer_email = "customer.growth.test@example.com"

    existing_customer = await db.users.find_one({"email": customer_email})

    if not existing_customer:
        print(f"\n2. Creating test customer: {customer_email}")

        customer_doc = {
            "id": customer_id,
            "email": customer_email,
            "phone": "555-CUSTOMER",
            "first_name": "Test",
            "last_name": "Customer",
            "role": "customer",
            "is_active": True,
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
            "addresses": []
        }

        await db.users.insert_one(customer_doc)
        print(f"   ✓ Created customer: {customer_email}")
    else:
        customer_id = existing_customer["id"]
        print(f"\n2. Using existing customer: {customer_email}")

    # 3. Insert 5 completed jobs
    print(f"\n3. Inserting 5 completed jobs for handyman...")

    jobs_inserted = 0

    for i in range(1, 6):
        job_id = f"growth-test-job-{i}"

        # Check if job already exists
        existing_job = await db.jobs.find_one({"id": job_id})
        if existing_job:
            print(f"   - Job {i} already exists, skipping")
            continue

        completion_date = datetime.utcnow() - timedelta(days=(30 - i * 5))

        job_doc = {
            "id": job_id,
            "customer_id": customer_id,
            "assigned_contractor_id": handyman_id,
            "service_category": ["plumbing", "electrical", "painting", "carpentry", "drywall"][i-1],
            "description": f"Test job {i} for growth unlock - completed on {completion_date.date()}",
            "status": "completed",
            "address": {
                "street": f"{i}23 Test St",
                "city": "Austin",
                "state": "TX",
                "zip_code": "78701"
            },
            "photos": [],
            "budget_max": 500.0,
            "created_at": (completion_date - timedelta(days=7)).isoformat(),
            "completed_at": completion_date.isoformat(),
            "updated_at": completion_date.isoformat()
        }

        await db.jobs.insert_one(job_doc)
        jobs_inserted += 1
        print(f"   ✓ Inserted job {i}: {job_id}")

    # 4. Verify growth unlock should trigger
    total_completed = await db.jobs.count_documents({
        "assigned_contractor_id": handyman_id,
        "status": "completed"
    })

    print(f"\n4. Verification:")
    print(f"   Total completed jobs for handyman: {total_completed}")
    print(f"   Growth unlock threshold: 3 jobs")
    print(f"   Growth center should be: {'✓ UNLOCKED' if total_completed >= 3 else '✗ LOCKED'}")

    print(f"\n5. Test Credentials:")
    print(f"   Handyman Email: {handyman_email}")
    print(f"   Handyman Password: testpassword123")
    print(f"   Handyman ID: {handyman_id}")

    print("\n" + "=" * 60)
    print("DATA INSERTION COMPLETE")
    print("=" * 60)
    print("\nNext steps:")
    print("1. Login as handyman using credentials above")
    print("2. Navigate to /handyman/growth/summary")
    print("3. Verify growth center is unlocked")
    print("4. Check growth events at /handyman/growth/events")

    client.close()

if __name__ == "__main__":
    asyncio.run(insert_test_data())

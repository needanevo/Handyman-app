#!/usr/bin/env python3
"""
Create test jobs for development and testing.

Usage:
    python create_test_jobs.py --customer-email customer@example.com --count 5

This script creates test jobs in the MongoDB database for testing
the contractor available jobs endpoint, job routing, and geofencing.
"""

import asyncio
import uuid
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
import argparse

# Load environment variables
load_dotenv('providers/providers.env')

MONGO_URL = os.getenv('MONGO_URL')
DB_NAME = os.getenv('DB_NAME', 'handyman')

# Test job templates
TEST_JOBS = [
    {
        "service_category": "Plumbing",
        "description": "Kitchen faucet replacement - leaking badly",
        "budget_max": 300,
        "urgency": "high"
    },
    {
        "service_category": "Electrical",
        "description": "Install ceiling fan in master bedroom",
        "budget_max": 400,
        "urgency": "medium"
    },
    {
        "service_category": "Drywall",
        "description": "Patch 3 holes in living room wall from TV mount removal",
        "budget_max": 200,
        "urgency": "low"
    },
    {
        "service_category": "Painting",
        "description": "Paint master bedroom - 12x14 room",
        "budget_max": 600,
        "urgency": "medium"
    },
    {
        "service_category": "Carpentry",
        "description": "Install custom shelving in garage",
        "budget_max": 800,
        "urgency": "low"
    },
    {
        "service_category": "HVAC",
        "description": "AC not cooling - possible refrigerant issue",
        "budget_max": 500,
        "urgency": "high"
    },
    {
        "service_category": "Flooring",
        "description": "Replace cracked tile in bathroom (5 tiles)",
        "budget_max": 350,
        "urgency": "medium"
    },
]


async def create_test_jobs(customer_email: str, count: int = 3):
    """Create test jobs for a specific customer."""

    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]

    try:
        # Find customer by email
        customer = await db.users.find_one({"email": customer_email})

        if not customer:
            print(f"❌ Customer not found: {customer_email}")
            print("\nAvailable customers:")
            async for user in db.users.find({"role": "customer"}, {"email": 1, "first_name": 1, "last_name": 1}):
                print(f"  - {user['email']} ({user.get('first_name', '')} {user.get('last_name', '')})")
            return

        # Get customer's default address
        addresses = customer.get("addresses", [])
        if not addresses:
            print(f"❌ Customer {customer_email} has no addresses. Please add an address first.")
            return

        default_address = next(
            (addr for addr in addresses if addr.get("is_default")),
            addresses[0]
        )

        print(f"✅ Found customer: {customer['email']}")
        print(f"   Customer ID: {customer['id']}")
        print(f"   Address: {default_address['street']}, {default_address['city']}, {default_address['state']}")

        # Check if address has coordinates
        if not default_address.get('latitude') or not default_address.get('longitude'):
            print(f"⚠️  WARNING: Address has no coordinates (lat/lon). Geofencing won't work!")
            print(f"   Please update the address with geocoded coordinates.")
        else:
            print(f"   Coordinates: {default_address['latitude']}, {default_address['longitude']} ✓")

        # Create test jobs
        jobs_to_create = TEST_JOBS[:count]
        created_jobs = []

        for i, job_template in enumerate(jobs_to_create, 1):
            # Calculate preferred date (3-7 days from now)
            preferred_date = (datetime.utcnow() + timedelta(days=3 + i)).isoformat()

            job = {
                "id": str(uuid.uuid4()),
                "customer_id": customer['id'],
                "address_id": default_address['id'],
                "service_category": job_template['service_category'],
                "description": job_template['description'],
                "status": "pending",  # pending = available for contractors
                "contractor_id": None,  # No contractor assigned yet
                "created_at": datetime.utcnow().isoformat(),
                "updated_at": datetime.utcnow().isoformat(),
                "photos": [],
                "budget_max": job_template['budget_max'],
                "urgency": job_template['urgency'],
                "preferred_dates": [preferred_date],
                "source": "test_script",
                "notes": "⚠️ TEST JOB - Created by create_test_jobs.py"
            }

            await db.jobs.insert_one(job)
            created_jobs.append(job)

            print(f"\n✅ Created test job {i}/{count}:")
            print(f"   Job ID: {job['id']}")
            print(f"   Category: {job['service_category']}")
            print(f"   Description: {job['description']}")
            print(f"   Max Budget: ${job['budget_max']}")
            print(f"   Status: {job['status']}")

        print(f"\n🎉 Successfully created {len(created_jobs)} test jobs!")
        print(f"\nThese jobs should now appear in the contractor's 'Available Jobs' screen")
        print(f"(if contractor has matching skills and is within 50 miles)")

    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        client.close()


async def delete_test_jobs():
    """Delete all test jobs (created by this script)."""

    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]

    try:
        result = await db.jobs.delete_many({"source": "test_script"})
        print(f"🗑️  Deleted {result.deleted_count} test jobs")
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        client.close()


async def list_all_jobs():
    """List all jobs in the database."""

    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]

    try:
        jobs_count = await db.jobs.count_documents({})
        print(f"\n📋 Total jobs in database: {jobs_count}\n")

        if jobs_count == 0:
            print("No jobs found.")
            return

        async for job in db.jobs.find({}):
            print(f"Job ID: {job['id']}")
            print(f"  Customer: {job.get('customer_id', 'N/A')}")
            print(f"  Category: {job.get('service_category', 'N/A')}")
            print(f"  Description: {job.get('description', 'N/A')}")
            print(f"  Status: {job.get('status', 'N/A')}")
            print(f"  Contractor: {job.get('contractor_id', 'None assigned')}")
            print(f"  Source: {job.get('source', 'N/A')}")
            print()

    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        client.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description='Manage test jobs for development')
    parser.add_argument('--create', action='store_true', help='Create test jobs')
    parser.add_argument('--delete', action='store_true', help='Delete all test jobs')
    parser.add_argument('--list', action='store_true', help='List all jobs')
    parser.add_argument('--customer-email', type=str, help='Customer email for test jobs')
    parser.add_argument('--count', type=int, default=3, help='Number of test jobs to create (default: 3)')

    args = parser.parse_args()

    if args.create:
        if not args.customer_email:
            print("❌ Error: --customer-email is required when creating jobs")
            print("\nExample: python create_test_jobs.py --create --customer-email customer@example.com --count 5")
        else:
            asyncio.run(create_test_jobs(args.customer_email, args.count))
    elif args.delete:
        asyncio.run(delete_test_jobs())
    elif args.list:
        asyncio.run(list_all_jobs())
    else:
        print("Usage:")
        print("  Create test jobs:  python create_test_jobs.py --create --customer-email customer@example.com --count 5")
        print("  Delete test jobs:  python create_test_jobs.py --delete")
        print("  List all jobs:     python create_test_jobs.py --list")

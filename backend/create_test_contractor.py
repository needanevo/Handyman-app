"""
Create a test contractor account for testing the contractor dashboard and workflows.

Usage:
    python backend/create_test_contractor.py

This script will create:
- Email: contractor@test.com
- Password: TestContractor123!
- Role: TECHNICIAN
- Status: Active with complete registration
"""

import asyncio
import os
import sys
from datetime import datetime, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
from passlib.context import CryptContext

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Load environment variables
load_dotenv('backend/providers/providers.env')

MONGO_URL = os.getenv('MONGO_URL')
DB_NAME = os.getenv('DB_NAME', 'handyman_app')

TEST_CONTRACTOR = {
    'email': 'contractor@test.com',
    'password': 'TestContractor123!',
    'first_name': 'John',
    'last_name': 'Contractor',
    'phone': '555-0123',
    'role': 'TECHNICIAN',
    'business_name': "John's Handyman Services",
    'skills': ['Drywall', 'Painting', 'Electrical', 'Plumbing', 'Carpentry'],
    'service_areas': ['21201', '21202', '21203', '21224', '21231'],
    'years_experience': 10,
    'registration_completed_date': datetime.utcnow(),
    'registration_expiration_date': datetime.utcnow() + timedelta(days=365),
    'registration_status': 'ACTIVE',
}


async def create_test_contractor():
    """Create test contractor account in MongoDB."""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]

    try:
        print("Connecting to MongoDB...")

        # Check if contractor already exists
        existing = await db.users.find_one({'email': TEST_CONTRACTOR['email']})
        if existing:
            print(f"Test contractor already exists with ID: {existing['id']}")
            print(f"Email: {TEST_CONTRACTOR['email']}")
            print(f"Password: {TEST_CONTRACTOR['password']}")
            print("\nYou can use these credentials to log in.")
            return

        # Generate unique ID
        import uuid
        user_id = str(uuid.uuid4())

        # Prepare user document
        user_doc = {
            'id': user_id,
            'email': TEST_CONTRACTOR['email'],
            'first_name': TEST_CONTRACTOR['first_name'],
            'last_name': TEST_CONTRACTOR['last_name'],
            'phone': TEST_CONTRACTOR['phone'],
            'role': TEST_CONTRACTOR['role'],
            'is_active': True,
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat(),
            # Contractor-specific fields
            'business_name': TEST_CONTRACTOR['business_name'],
            'skills': TEST_CONTRACTOR['skills'],
            'service_areas': TEST_CONTRACTOR['service_areas'],
            'years_experience': TEST_CONTRACTOR['years_experience'],
            'registration_completed_date': TEST_CONTRACTOR['registration_completed_date'].isoformat(),
            'registration_expiration_date': TEST_CONTRACTOR['registration_expiration_date'].isoformat(),
            'registration_status': TEST_CONTRACTOR['registration_status'],
            'last_renewal_date': None,
            'renewal_notifications_sent': {
                'thirty_day': False,
                'seven_day': False,
                'expiration': False
            },
            # Portfolio and documents (mock data)
            'portfolio_photos': [],
            'documents': {
                'license': None,
                'insurance': None,
                'certifications': []
            }
        }

        # Hash password
        hashed_password = pwd_context.hash(TEST_CONTRACTOR['password'])

        # Create password document
        password_doc = {
            'user_id': user_id,
            'hashed_password': hashed_password,
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }

        # Insert documents
        print("Creating test contractor...")
        await db.users.insert_one(user_doc)
        await db.user_passwords.insert_one(password_doc)

        print("\nTest contractor created successfully!")
        print("=" * 50)
        print(f"Email: {TEST_CONTRACTOR['email']}")
        print(f"Password: {TEST_CONTRACTOR['password']}")
        print(f"User ID: {user_id}")
        print(f"Role: {TEST_CONTRACTOR['role']}")
        print(f"Business: {TEST_CONTRACTOR['business_name']}")
        print(f"Skills: {', '.join(TEST_CONTRACTOR['skills'])}")
        print(f"Registration Status: {TEST_CONTRACTOR['registration_status']}")
        print(f"Registration Expires: {TEST_CONTRACTOR['registration_expiration_date'].strftime('%Y-%m-%d')}")
        print("=" * 50)
        print("\nYou can now log in with these credentials.")

    except Exception as e:
        print(f"Error creating test contractor: {e}")
        import traceback
        traceback.print_exc()
    finally:
        client.close()


if __name__ == '__main__':
    asyncio.run(create_test_contractor())

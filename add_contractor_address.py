"""
Add test business address to contractor account for geo-boundary testing.
"""
import asyncio
import os
import uuid
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import sys

# Add backend to path
sys.path.insert(0, '/srv/handyman-app/Handyman-app-main/backend')
load_dotenv('/srv/handyman-app/Handyman-app-main/backend/providers/providers.env')

async def add_contractor_address():
    # Connect to MongoDB
    client = AsyncIOMotorClient(os.getenv('MONGO_URL'))
    db = client[os.getenv('DB_NAME')]

    contractor_email = "contractor@test.com"

    # Find contractor
    contractor = await db.users.find_one({"email": contractor_email})
    if not contractor:
        print(f"Contractor {contractor_email} not found")
        return

    print(f"Found contractor: {contractor['id']}")
    print(f"Current addresses: {len(contractor.get('addresses', []))}")

    # Baltimore address for testing
    test_address = {
        "id": str(uuid.uuid4()),
        "street": "123 Main Street",
        "city": "Baltimore",
        "state": "MD",
        "zip_code": "21201",
        "latitude": 39.2904,  # Baltimore coordinates
        "longitude": -76.6122,
        "is_default": True
    }

    # Add address to contractor
    result = await db.users.update_one(
        {"id": contractor["id"]},
        {"$push": {"addresses": test_address}}
    )

    if result.modified_count > 0:
        print(f"✅ Added business address to contractor")
        print(f"   Address: {test_address['street']}, {test_address['city']}, {test_address['state']}")
        print(f"   Coordinates: ({test_address['latitude']}, {test_address['longitude']})")
    else:
        print("❌ Failed to add address")

    client.close()

if __name__ == "__main__":
    asyncio.run(add_contractor_address())

"""
Clean up duplicate addresses from user profile.
Keeps only the first address and removes duplicates.
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os

# Load environment variables
env_path = os.path.join(os.path.dirname(__file__), 'providers', 'providers.env')
load_dotenv(env_path)

MONGO_URL = os.getenv('MONGO_URL')
DB_NAME = os.getenv('DB_NAME', 'handyman_db')

async def cleanup_duplicate_addresses(user_email: str):
    """Remove duplicate addresses for a user, keeping only the first one."""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]

    try:
        # Find the user
        user = await db.users.find_one({"email": user_email})
        if not user:
            print(f"User {user_email} not found")
            return

        addresses = user.get('addresses', [])
        print(f"\nUser: {user['email']}")
        print(f"Found {len(addresses)} addresses")

        if len(addresses) <= 1:
            print("No duplicates to remove")
            return

        # Keep only the first address
        first_address = addresses[0]
        print(f"\nKeeping first address: {first_address['street']}, {first_address['city']}, {first_address['state']} {first_address['zip_code']}")

        # Update user to have only the first address
        result = await db.users.update_one(
            {"email": user_email},
            {"$set": {"addresses": [first_address]}}
        )

        if result.modified_count > 0:
            print(f"✓ Removed {len(addresses) - 1} duplicate addresses")
        else:
            print("✗ Failed to update addresses")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    # Clean up addresses for the contractor user
    asyncio.run(cleanup_duplicate_addresses("cipherbmw@protonmail.com"))

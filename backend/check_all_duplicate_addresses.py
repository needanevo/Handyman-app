"""
Check all users for duplicate addresses.
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

async def check_duplicates():
    """Check all users for duplicate addresses."""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]

    try:
        users = await db.users.find({}).to_list(length=None)
        print(f"Total users: {len(users)}\n")

        users_with_duplicates = 0

        for user in users:
            addresses = user.get("addresses", [])
            if len(addresses) > 1:
                users_with_duplicates += 1
                print(f"User: {user.get('email')}")
                print(f"  Role: {user.get('role')}")
                print(f"  Addresses: {len(addresses)}")
                for i, addr in enumerate(addresses):
                    print(f"    {i+1}. {addr.get('street', 'N/A')}, {addr.get('city', 'N/A')}, {addr.get('state', 'N/A')}")
                print()

        if users_with_duplicates == 0:
            print("✓ No users with duplicate addresses found!")
        else:
            print(f"Found {users_with_duplicates} users with duplicate addresses")

    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(check_duplicates())

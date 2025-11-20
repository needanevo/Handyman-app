"""
Geocode existing business address for contractor.
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import os
import sys

# Add parent directory to path to import providers
sys.path.insert(0, os.path.dirname(__file__))

import aiohttp

# Load environment variables
env_path = os.path.join(os.path.dirname(__file__), 'providers', 'providers.env')
load_dotenv(env_path)

MONGO_URL = os.getenv('MONGO_URL')
DB_NAME = os.getenv('DB_NAME', 'handyman_db')

async def geocode_with_nominatim(address_string: str):
    """Geocode using OpenStreetMap Nominatim (free, no API key required)."""
    url = "https://nominatim.openstreetmap.org/search"
    params = {
        "format": "json",
        "q": address_string,
        "limit": 1
    }
    headers = {
        "User-Agent": "HandymanApp/1.0"  # Required by Nominatim
    }

    async with aiohttp.ClientSession() as session:
        async with session.get(url, params=params, headers=headers) as response:
            data = await response.json()
            if data and len(data) > 0:
                return {
                    "latitude": float(data[0]["lat"]),
                    "longitude": float(data[0]["lon"])
                }
            return None

async def geocode_address(user_email: str):
    """Geocode the business address for a contractor."""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]

    try:
        # Find the user
        user = await db.users.find_one({"email": user_email})
        if not user:
            print(f"User {user_email} not found")
            return

        addresses = user.get('addresses', [])
        if not addresses:
            print("No addresses found")
            return

        # Get first address (business address)
        address = addresses[0]
        print(f"\nBusiness Address:")
        print(f"  {address.get('street')}")
        print(f"  {address.get('city')}, {address.get('state')} {address.get('zip_code')}")
        print(f"  Current Lat/Lon: {address.get('latitude')}, {address.get('longitude')}")

        # Geocode the address using Nominatim
        address_string = f"{address['street']}, {address['city']}, {address['state']} {address['zip_code']}"
        print(f"\nGeocoding with Nominatim: {address_string}")

        result = await geocode_with_nominatim(address_string)

        if result:
            latitude = result['latitude']
            longitude = result['longitude']
            print(f"✓ Geocoded to: {latitude}, {longitude}")

            # Update the address in database
            result = await db.users.update_one(
                {"email": user_email},
                {
                    "$set": {
                        "addresses.0.latitude": latitude,
                        "addresses.0.longitude": longitude
                    }
                }
            )

            if result.modified_count > 0:
                print("✓ Address updated in database")
            else:
                print("✗ Failed to update address")
        else:
            print("✗ Geocoding failed - no result returned")

    except Exception as e:
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(geocode_address("cipherbmw@protonmail.com"))

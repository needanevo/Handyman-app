"""
Script to check contractor data and photos in MongoDB.
Shows raw data structure and photo URLs.
"""
import asyncio
import os
import sys
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import json

sys.path.insert(0, '/srv/handyman-app/Handyman-app-main/backend')
load_dotenv('/srv/handyman-app/Handyman-app-main/backend/providers/providers.env')

async def check_contractor(email: str):
    """Check contractor data and photo storage"""
    client = AsyncIOMotorClient(os.getenv('MONGO_URL'))
    db = client[os.getenv('DB_NAME')]

    print(f"\n{'='*80}")
    print(f"CHECKING CONTRACTOR: {email}")
    print(f"{'='*80}\n")

    # Find contractor
    contractor = await db.users.find_one({"email": email})

    if not contractor:
        print(f"❌ Contractor not found: {email}")
        return

    print(f"✅ Contractor found: {contractor['id']}")
    print(f"\n📋 BASIC INFO:")
    print(f"   Name: {contractor.get('first_name')} {contractor.get('last_name')}")
    print(f"   Role: {contractor.get('role')}")
    print(f"   Business: {contractor.get('business_name', 'N/A')}")
    print(f"   Phone: {contractor.get('phone')}")
    print(f"   Active: {contractor.get('is_active')}")

    # Check documents
    print(f"\n📄 DOCUMENTS:")
    documents = contractor.get('documents', {})
    if documents:
        print(f"   License: {documents.get('license', 'None')}")
        print(f"   Business License: {documents.get('business_license', 'None')}")
        print(f"   Insurance: {documents.get('insurance', 'None')}")
    else:
        print(f"   ❌ No documents found")

    # Check portfolio photos
    print(f"\n📸 PORTFOLIO PHOTOS:")
    portfolio = contractor.get('portfolio_photos', [])
    if portfolio:
        for i, photo in enumerate(portfolio, 1):
            print(f"   {i}. {photo}")
    else:
        print(f"   ❌ No portfolio photos found")

    # Check addresses
    print(f"\n📍 ADDRESSES:")
    addresses = contractor.get('addresses', [])
    if addresses:
        for i, addr in enumerate(addresses, 1):
            print(f"   {i}. {addr.get('street', 'N/A')}, {addr.get('city', 'N/A')}, {addr.get('state', 'N/A')}")
            print(f"      Coordinates: ({addr.get('latitude', 'N/A')}, {addr.get('longitude', 'N/A')})")
    else:
        print(f"   ❌ No addresses found")

    # Check skills
    print(f"\n🔧 SKILLS:")
    skills = contractor.get('skills', [])
    if skills:
        print(f"   {', '.join(skills)}")
    else:
        print(f"   ❌ No skills found")

    # Print raw JSON for debugging
    print(f"\n🔍 RAW DATA (JSON):")
    print(json.dumps({
        'id': contractor['id'],
        'email': contractor['email'],
        'documents': contractor.get('documents'),
        'portfolio_photos': contractor.get('portfolio_photos'),
        'skills': contractor.get('skills'),
        'addresses': contractor.get('addresses'),
    }, indent=2, default=str))

    client.close()

async def clear_contractor_photos(email: str, confirm: bool = False):
    """Clear all photo references for a contractor"""
    if not confirm:
        print("\n⚠️  DRY RUN MODE - No changes will be made")
        print("   To actually clear photos, run with confirm=True")
        return

    client = AsyncIOMotorClient(os.getenv('MONGO_URL'))
    db = client[os.getenv('DB_NAME')]

    contractor = await db.users.find_one({"email": email})
    if not contractor:
        print(f"❌ Contractor not found: {email}")
        return

    print(f"\n🗑️  CLEARING PHOTOS FOR: {email}")

    result = await db.users.update_one(
        {"email": email},
        {
            "$unset": {
                "documents": "",
                "portfolio_photos": ""
            }
        }
    )

    if result.modified_count > 0:
        print(f"✅ Cleared all photo references")
    else:
        print(f"❌ No changes made")

    client.close()

if __name__ == "__main__":
    import sys

    if len(sys.argv) < 2:
        print("Usage: python check_contractor_data.py <email> [clear]")
        print("\nExamples:")
        print("  python check_contractor_data.py cipherbmw@gmail.com")
        print("  python check_contractor_data.py cipherbmw@gmail.com clear")
        sys.exit(1)

    email = sys.argv[1]
    should_clear = len(sys.argv) > 2 and sys.argv[2] == "clear"

    asyncio.run(check_contractor(email))

    if should_clear:
        print("\n" + "="*80)
        confirm = input("\n⚠️  Are you sure you want to CLEAR ALL PHOTOS? Type 'YES' to confirm: ")
        if confirm == "YES":
            asyncio.run(clear_contractor_photos(email, confirm=True))
        else:
            print("❌ Cancelled")

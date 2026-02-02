"""
Data Migration Script: Migrate role "technician" to "contractor"

This script updates all users with role="technician" to role="contractor"
to align with the new canonical role naming.

Usage:
    python backend/migrate_technician_to_contractor.py

Safety:
- Performs a dry run first (shows what would be changed)
- Asks for confirmation before making changes
- Only updates the role field, no other data is touched
"""

import asyncio
import os
import sys
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Load environment variables
load_dotenv('backend/providers/providers.env')

MONGO_URL = os.getenv('MONGO_URL')
DB_NAME = os.getenv('DB_NAME', 'handyman_app')


async def migrate_roles():
    """Migrate technician roles to contractor."""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]

    try:
        print("=" * 60)
        print("ROLE MIGRATION: technician → contractor")
        print("=" * 60)
        print()

        # Find all users with role="technician"
        technician_users = await db.users.find({"role": "technician"}).to_list(length=None)

        if not technician_users:
            print("✅ No users with role='technician' found.")
            print("   Migration not needed - database is already up to date!")
            return

        print(f"Found {len(technician_users)} user(s) with role='technician':")
        print()
        for user in technician_users:
            print(f"  - {user.get('email')} (ID: {user.get('id')})")
            print(f"    Name: {user.get('first_name')} {user.get('last_name')}")
            print(f"    Business: {user.get('business_name', 'N/A')}")
            print()

        # Ask for confirmation
        response = input("Migrate these users to role='contractor'? (yes/no): ").strip().lower()

        if response != 'yes':
            print("\n❌ Migration cancelled by user.")
            return

        # Perform migration
        print("\nMigrating users...")
        result = await db.users.update_many(
            {"role": "technician"},
            {"$set": {"role": "contractor"}}
        )

        print()
        print("=" * 60)
        print("✅ MIGRATION COMPLETE")
        print("=" * 60)
        print(f"Updated {result.modified_count} user(s)")
        print()
        print("Changes:")
        print("  - role: 'technician' → 'contractor'")
        print()
        print("Note: All other user data remains unchanged.")

    except Exception as e:
        print(f"\n❌ Error during migration: {e}")
        import traceback
        traceback.print_exc()
    finally:
        client.close()


async def verify_migration():
    """Verify migration results."""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]

    try:
        # Count users by role
        contractor_count = await db.users.count_documents({"role": "contractor"})
        technician_count = await db.users.count_documents({"role": "technician"})
        handyman_count = await db.users.count_documents({"role": "handyman"})
        customer_count = await db.users.count_documents({"role": "customer"})

        print("\n" + "=" * 60)
        print("VERIFICATION: Current role distribution")
        print("=" * 60)
        print(f"  contractor: {contractor_count}")
        print(f"  handyman:   {handyman_count}")
        print(f"  customer:   {customer_count}")
        print(f"  technician: {technician_count} (legacy - should be 0)")
        print("=" * 60)

        if technician_count > 0:
            print("\n⚠️  Warning: Some users still have role='technician'")
        else:
            print("\n✅ All users migrated successfully!")

    except Exception as e:
        print(f"\n❌ Error during verification: {e}")
    finally:
        client.close()


if __name__ == '__main__':
    print("\nStarting role migration...")
    asyncio.run(migrate_roles())
    asyncio.run(verify_migration())
    print("\nMigration script completed.")

#!/usr/bin/env python3
"""
Admin Promotion Script

Promote a user to admin role by email.
Run from the backend directory:
    python promote_to_admin.py user@example.com

Requirements:
    - MongoDB connection via MONGODB_URI env var or default
    - User must exist in the database
"""

import os
import sys
from dotenv import load_dotenv
from pymongo import MongoClient
from datetime import datetime

# Load environment
load_dotenv("backend/.env")
load_dotenv("backend/providers/providers.env")

MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("MONGODB_DB", "handyman")


def promote_to_admin(email: str):
    """Promote a user to admin role"""
    client = MongoClient(MONGODB_URI)
    db = client[DB_NAME]
    
    # Find user by email
    user = db.users.find_one({"email": email})
    
    if not user:
        print(f"❌ User with email '{email}' not found")
        return False
    
    # Update user to admin role
    result = db.users.update_one(
        {"email": email},
        {
            "$set": {
                "role": "admin",
                "updated_at": datetime.utcnow().isoformat()
            }
        }
    )
    
    if result.modified_count > 0:
        print(f"✅ User '{email}' promoted to admin role")
        print(f"   User ID: {user.get('id', 'unknown')}")
        return True
    else:
        print(f"❌ Failed to update user '{email}'")
        return False


def demote_from_admin(email: str):
    """Demote an admin to customer role"""
    client = MongoClient(MONGODB_URI)
    db = client[DB_NAME]
    
    # Find user by email
    user = db.users.find_one({"email": email})
    
    if not user:
        print(f"❌ User with email '{email}' not found")
        return False
    
    # Update user to customer role
    result = db.users.update_one(
        {"email": email},
        {
            "$set": {
                "role": "customer",
                "updated_at": datetime.utcnow().isoformat()
            }
        }
    )
    
    if result.modified_count > 0:
        print(f"✅ User '{email}' demoted to customer role")
        return True
    else:
        print(f"❌ Failed to update user '{email}'")
        return False


def list_admins():
    """List all admin users"""
    client = MongoClient(MONGODB_URI)
    db = client[DB_NAME]
    
    admins = list(db.users.find({"role": "admin"}))
    
    print(f"\n👥 Admin Users ({len(admins)} total):")
    for admin in admins:
        print(f"   - {admin.get('email', 'unknown')} (ID: {admin.get('id', 'unknown')})")
    
    return admins


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage:")
        print("  python promote_to_admin.py <email>     - Promote user to admin")
        print("  python promote_to_admin.py --list    - List all admins")
        print("  python promote_to_admin.py --demote <email> - Demote admin to customer")
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == "--list":
        list_admins()
    elif command == "--demote":
        if len(sys.argv) < 3:
            print("Error: Email required for --demote")
            sys.exit(1)
        demote_from_admin(sys.argv[2])
    else:
        promote_to_admin(command)

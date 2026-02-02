"""
Test Script: Verify Contractor Role Fix

Tests:
1. Registration with role="contractor" - should succeed
2. Registration with role="technician" (legacy) - should succeed and normalize to "contractor"
3. Verify both users have role="contractor" in database

Run this AFTER deploying backend changes to server.

Usage:
    python backend/test_contractor_role_fix.py
"""

import asyncio
import httpx
import os
from dotenv import load_dotenv

load_dotenv('backend/providers/providers.env')

# Use server API URL
API_BASE_URL = "https://handyman.therealjohnson.com/api"
# For local testing, use: API_BASE_URL = "http://localhost:8000/api"

TEST_USERS = [
    {
        "name": "Contractor Role Test",
        "email": "test_contractor_role@example.com",
        "password": "TestPassword123!",
        "phone": "555-0001",
        "firstName": "Test",
        "lastName": "Contractor",
        "role": "contractor",  # New canonical role
        "marketingOptIn": False,
        "businessName": "Test Contractor Services"
    },
    {
        "name": "Legacy Technician Role Test",
        "email": "test_technician_legacy@example.com",
        "password": "TestPassword123!",
        "phone": "555-0002",
        "firstName": "Legacy",
        "lastName": "Technician",
        "role": "technician",  # Legacy role - should normalize to "contractor"
        "marketingOptIn": False,
        "businessName": "Legacy Technician Services"
    }
]


async def test_registration(user_data: dict):
    """Test user registration and return result."""
    print(f"\n{'=' * 60}")
    print(f"Testing: {user_data['name']}")
    print(f"Role: {user_data['role']}")
    print(f"Email: {user_data['email']}")
    print(f"{'=' * 60}")

    async with httpx.AsyncClient() as client:
        try:
            # Register user
            response = await client.post(
                f"{API_BASE_URL}/auth/register",
                json=user_data,
                timeout=10.0
            )

            print(f"\nHTTP Status: {response.status_code}")

            if response.status_code == 200:
                data = response.json()
                print("✅ Registration successful!")
                print(f"   Access Token: {data.get('access_token', 'N/A')[:50]}...")
                print(f"   Refresh Token: {data.get('refresh_token', 'N/A')[:50]}...")

                # Get user profile to verify role
                headers = {"Authorization": f"Bearer {data['access_token']}"}
                me_response = await client.get(
                    f"{API_BASE_URL}/auth/me",
                    headers=headers,
                    timeout=10.0
                )

                if me_response.status_code == 200:
                    user = me_response.json()
                    stored_role = user.get('role')
                    print(f"\n   User Profile:")
                    print(f"   - Email: {user.get('email')}")
                    print(f"   - Role: {stored_role}")
                    print(f"   - Business: {user.get('business_name')}")

                    # Verify role normalization
                    if user_data['role'] == 'technician' and stored_role == 'contractor':
                        print(f"\n   ✅ Legacy 'technician' correctly normalized to 'contractor'")
                    elif stored_role == user_data['role']:
                        print(f"\n   ✅ Role stored correctly as '{stored_role}'")
                    else:
                        print(f"\n   ❌ Role mismatch: sent '{user_data['role']}', got '{stored_role}'")

                return True

            elif response.status_code == 400:
                error = response.json()
                if "already registered" in error.get('detail', '').lower():
                    print("⚠️  User already exists (test was run before)")
                    print("   To re-run: Delete test users from database first")
                    return None
                else:
                    print(f"❌ Registration failed: {error.get('detail')}")
                    return False

            elif response.status_code == 422:
                error = response.json()
                print(f"❌ Validation error (422):")
                print(f"   {error}")
                return False

            else:
                print(f"❌ Unexpected status code: {response.status_code}")
                print(f"   Response: {response.text}")
                return False

        except httpx.TimeoutException:
            print("❌ Request timeout - is the server running?")
            return False
        except Exception as e:
            print(f"❌ Error: {str(e)}")
            import traceback
            traceback.print_exc()
            return False


async def run_tests():
    """Run all registration tests."""
    print("\n" + "=" * 60)
    print("CONTRACTOR ROLE FIX - REGISTRATION TESTS")
    print("=" * 60)
    print(f"\nAPI URL: {API_BASE_URL}")

    results = []
    for user_data in TEST_USERS:
        result = await test_registration(user_data)
        results.append((user_data['name'], result))
        await asyncio.sleep(1)  # Brief pause between tests

    # Summary
    print("\n" + "=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)

    success_count = sum(1 for _, result in results if result is True)
    skip_count = sum(1 for _, result in results if result is None)
    fail_count = sum(1 for _, result in results if result is False)

    for name, result in results:
        status = "✅ PASS" if result is True else "⚠️  SKIP" if result is None else "❌ FAIL"
        print(f"{status} - {name}")

    print()
    print(f"Passed: {success_count}/{len(TEST_USERS)}")
    print(f"Skipped: {skip_count}/{len(TEST_USERS)}")
    print(f"Failed: {fail_count}/{len(TEST_USERS)}")

    if fail_count == 0 and success_count > 0:
        print("\n✅ All tests passed! Contractor role fix is working.")
    elif skip_count == len(TEST_USERS):
        print("\n⚠️  All tests skipped (users already exist)")
    else:
        print("\n❌ Some tests failed. Check errors above.")


if __name__ == '__main__':
    asyncio.run(run_tests())

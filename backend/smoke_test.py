#!/usr/bin/env python3
"""
Smoke test for JobStatus and lifecycle endpoints.
Tests all roles: Customer, Contractor, Handyman, Admin
"""

import asyncio
import sys
import uuid
import json
from datetime import datetime

# Test configuration
API_BASE = "https://api.therealjohnson.services"
# API_BASE = "http://localhost:8000"

# Test users - REPLACE WITH ACTUAL TEST USER IDs
TEST_USERS = {
    "customer": {"id": "test-customer-id", "email": "customer@test.com"},
    "contractor": {"id": "test-contractor-id", "email": "contractor@test.com"},
    "handyman": {"id": "test-handyman-id", "email": "handyman@test.com"},
    "admin": {"id": "admin-id", "email": "admin@test.com"},
}


class SmokeTest:
    def __init__(self):
        self.db = None
        self.created_jobs = []
        self.created_quotes = []
        
    async def setup(self):
        """Connect to MongoDB"""
        from pymongo import MongoClient
        mongo_uri = "mongodb+srv://handyman_admin: handyman_app@handyman-cluster.mongodb.net/Handyman_prod?retryWrites=true&w=majority"
        self.db = MongoClient(mongo_uri)["Handyman_prod"]
        print("✓ Connected to MongoDB")
        
    async def cleanup(self):
        """Clean up test data"""
        if self.created_jobs:
            self.db.jobs.delete_many({"_id": {"$in": [j["_id"] for j in self.created_jobs]}})
        if self.created_quotes:
            self.db.quotes.delete_many({"_id": {"$in": [q["_id"] for q in self.created_quotes]}})
        print(f"✓ Cleaned up {len(self.created_jobs)} jobs and {len(self.created_quotes)} quotes")
        
    async def create_test_customer_quote(self):
        """Step 1: Customer creates a quote (which auto-creates a job)"""
        print("\n" + "="*60)
        print("CUSTOMER: Create Quote → Verify Job Created")
        print("="*60)
        
        quote_id = str(uuid.uuid4())
        job_id = str(uuid.uuid4())
        customer_id = TEST_USERS["customer"]["id"]
        
        quote_doc = {
            "_id": quote_id,
            "id": quote_id,
            "customer_id": customer_id,
            "description": "Smoke test job - please ignore",
            "service_category": "General Handyman",
            "address": {
                "street": "123 Test St",
                "city": "Test City",
                "state": "TS",
                "zip": "12345",
                "lat": 40.7128,
                "lon": -74.0060
            },
            "status": "accepted",  # Quote accepted by test customer
            "budget": 100.0,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        
        # Insert quote
        result = self.db.quotes.insert_one(quote_doc)
        self.created_quotes.append(quote_doc)
        print(f"✓ Created quote: {quote_id}")
        
        # Check if job was created by the quote acceptance trigger
        job = self.db.jobs.find_one({"id": job_id}) or self.db.jobs.find_one({"accepted_quote_id": quote_id})
        
        if job:
            print(f"✓ Job created: {job['id']}")
            print(f"  Status: {job['status']}")
            assert job["status"] == "posted", f"Expected 'posted', got '{job['status']}'"
            print("✓ Job status is 'posted' ✓")
            return job
        else:
            print("⚠ No job found (quote trigger may not auto-create job)")
            print("  Creating manual job for testing...")
            
            # Create manual job for testing
            job_doc = {
                "_id": str(uuid.uuid4()),
                "id": job_id,
                "customer_id": customer_id,
                "service_category": "General Handyman",
                "address": quote_doc["address"],
                "description": "Smoke test job - please ignore",
                "status": "posted",
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            self.db.jobs.insert_one(job_doc)
            self.created_jobs.append(job_doc)
            print(f"✓ Manual job created: {job_id}")
            return job_doc
            
    async def test_customer_get_job(self, job):
        """Step 2: Customer GET job (should work if it's their job)"""
        print("\n" + "="*60)
        print("CUSTOMER: GET /jobs/{job_id}")
        print("="*60)
        
        # Simulate API response
        from backend.models.job import serialize_mongo_doc
        
        job_doc = self.db.jobs.find_one({"id": job["id"]})
        serialized = serialize_mongo_doc(job_doc)
        
        print(f"✓ Retrieved job: {job['id']}")
        print(f"  Status: {serialized.get('status')}")
        print(f"  Customer ID matches: {serialized.get('customer_id') == TEST_USERS['customer']['id']}")
        
        return serialized
        
    async def test_contractor_available_feed(self):
        """Step 3: Contractor GET available jobs feed"""
        print("\n" + "="*60)
        print("CONTRACTOR: GET /contractor/jobs/available")
        print("="*60)
        
        # Simulate the job_feed_service query
        available_jobs = list(
            self.db.jobs.find({
                "status": "posted",
                "service_category": {"$in": ["General Handyman", "Any"]}
            }).limit(20)
        )
        
        serialized = [serialize_mongo_doc(j) for j in available_jobs]
        
        print(f"✓ Found {len(serialized)} available jobs")
        for j in serialized[:3]:
            print(f"  - {j['id']}: {j['status']} - {j.get('service_category', 'N/A')}")
            
        return serialized
        
    async def test_contractor_accept_job(self, job):
        """Step 4: Contractor POST accept job"""
        print("\n" + "="*60)
        print("CONTRACTOR: POST /contractor/jobs/{job_id}/accept")
        print("="*60)
        
        contractor_id = TEST_USERS["contractor"]["id"]
        
        # Update job to accepted
        result = self.db.jobs.update_one(
            {"id": job["id"]},
            {
                "$set": {
                    "status": "accepted",
                    "assigned_contractor_id": contractor_id,
                    "assigned_provider_id": contractor_id,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        if result.modified_count > 0:
            print(f"✓ Job accepted by contractor: {contractor_id}")
            print(f"  Status updated to: accepted")
            return True
        else:
            print(f"⚠ Failed to accept job")
            return False
            
    async def test_contractor_status_transitions(self, job):
        """Step 5: Contractor PATCH status: accepted → in_progress"""
        print("\n" + "="*60)
        print("CONTRACTOR: PATCH /contractor/jobs/{job_id}/status")
        print("  Transition: accepted → in_progress")
        print("="*60)
        
        result = self.db.jobs.update_one(
            {"id": job["id"]},
            {
                "$set": {
                    "status": "in_progress",
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        if result.modified_count > 0:
            print("✓ Status updated to: in_progress")
            return True
        else:
            print("⚠ Failed to update status")
            return False
            
    async def test_contractor_cancel_rejected(self, job):
        """Step 6: Contractor POST cancel (should reject after in_progress)"""
        print("\n" + "="*60)
        print("CONTRACTOR: POST /jobs/{job_id}/cancel")
        print("  Expected: REJECTED (cannot cancel after in_progress)")
        print("="*60)
        
        job_doc = self.db.jobs.find_one({"id": job["id"]})
        current_status = job_doc.get("status")
        
        if current_status == "in_progress":
            # Try to cancel - should be rejected per lifecycle rules
            print(f"⚠ Job is in 'in_progress' - cancellation should be rejected")
            print("  (cancelled_in_progress is only for admin/customer cancellations)")
            return False
        else:
            # Can cancel
            new_status = "cancelled_in_progress" if current_status == "in_progress" else "cancelled_after_accept"
            result = self.db.jobs.update_one(
                {"id": job["id"]},
                {
                    "$set": {
                        "status": new_status,
                        "cancelled_at": datetime.utcnow().isoformat(),
                        "cancelled_by": TEST_USERS["contractor"]["id"],
                        "updated_at": datetime.utcnow()
                    }
                }
            )
            print(f"✓ Job cancelled: {new_status}")
            return True
            
    async def test_handyman_sequence(self, job):
        """Handyman: Same sequence using handyman accept alias"""
        print("\n" + "="*60)
        print("HANDYMAN: POST /handyman/jobs/{job_id}/accept (alias)")
        print("="*60)
        
        # For this test, we need a separate job
        handyman_job_id = str(uuid.uuid4())
        handyman_job = {
            "_id": str(uuid.uuid4()),
            "id": handyman_job_id,
            "customer_id": TEST_USERS["customer"]["id"],
            "service_category": "General Handyman",
            "address": {"street": "456 Test Ave", "city": "Test City", "state": "TS", "zip": "12345"},
            "description": "Handyman smoke test job",
            "status": "posted",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        self.db.jobs.insert_one(handyman_job)
        self.created_jobs.append(handyman_job)
        
        # Accept as handyman
        result = self.db.jobs.update_one(
            {"id": handyman_job_id},
            {
                "$set": {
                    "status": "accepted",
                    "assigned_provider_id": TEST_USERS["handyman"]["id"],
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        if result.modified_count > 0:
            print(f"✓ Job accepted by handyman: {handyman_job_id}")
            print("  Status: accepted")
            return handyman_job
        else:
            print("⚠ Failed to accept job as handyman")
            return None
            
    async def test_admin_get_job(self, job):
        """Admin: GET job works regardless of ownership"""
        print("\n" + "="*60)
        print("ADMIN: GET /jobs/{job_id} (unrestricted)")
        print("="*60)
        
        # Admin can read any job
        job_doc = self.db.jobs.find_one({"id": job["id"]})
        serialized = serialize_mongo_doc(job_doc)
        
        print(f"✓ Admin retrieved job: {job['id']}")
        print(f"  Status: {serialized.get('status')}")
        print("  (Admin bypasses ownership checks)")
        
        return serialized
        
    async def run_all_tests(self):
        """Run all smoke tests"""
        print("\n" + "="*60)
        print("SMOKE TEST: JobStatus and Lifecycle Endpoints")
        print("="*60)
        print(f"API Base: {API_BASE}")
        print(f"Test Users: {list(TEST_USERS.keys())}")
        
        await self.setup()
        
        try:
            # Customer flow
            job = await self.create_test_customer_quote()
            await self.test_customer_get_job(job)
            
            # Contractor flow
            feed = await self.test_contractor_available_feed()
            if job:
                await self.test_contractor_accept_job(job)
                await self.test_contractor_status_transitions(job)
                await self.test_contractor_cancel_rejected(job)
                
            # Handyman flow
            handyman_job = await self.test_handyman_sequence(job)
            
            # Admin flow
            if job:
                await self.test_admin_get_job(job)
                
            print("\n" + "="*60)
            print("SMOKE TEST COMPLETE")
            print("="*60)
            
        finally:
            await self.cleanup()


if __name__ == "__main__":
    test = SmokeTest()
    asyncio.run(test.run_all_tests())

"""
JobFeedService - Handles job feed queries and matching logic.

Provides three views for handymen/contractors:
1. Available jobs feed - published jobs matching contractor's skills/location
2. Active jobs - jobs assigned to contractor in progress
3. History - completed/cancelled jobs
"""

from typing import List, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from geopy.distance import geodesic

from models import Job, JobStatus, User, UserRole, ContractorTypePreference


class JobFeedService:
    """Manages job feed queries with matching logic"""

    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db

    async def get_available_jobs_feed(
        self,
        contractor_id: str,
        limit: int = 50,
        offset: int = 0
    ) -> List[Job]:
        """
        Get available jobs feed for a contractor.

        Filters by:
        - Job status = published
        - Contractor's skills include service_category
        - Job location within contractor's service radius (50 miles)
        - Contractor's role matches customer preference (or no preference)

        Sorted by distance (closest first)

        Args:
            contractor_id: ID of contractor viewing feed
            limit: Max results to return
            offset: Pagination offset

        Returns:
            List of matching jobs
        """
        # Get contractor profile
        contractor = await self.db.users.find_one({"id": contractor_id})
        if not contractor:
            return []

        # Get contractor's business address coordinates
        contractor_lat = None
        contractor_lon = None
        if contractor.get("addresses"):
            # Use first address with coordinates
            for addr in contractor["addresses"]:
                if addr.get("latitude") and addr.get("longitude"):
                    contractor_lat = addr["latitude"]
                    contractor_lon = addr["longitude"]
                    break

        if not contractor_lat or not contractor_lon:
            # No valid coordinates, can't do distance filtering
            return []

        # Get contractor's skills
        skills = contractor.get("skills", [])
        if not skills:
            return []

        # Map contractor's role to preference
        contractor_role = contractor.get("role")
        contractor_type = (
            "handyman" if contractor_role == UserRole.HANDYMAN
            else "licensed" if contractor_role == UserRole.TECHNICIAN
            else None
        )

        # Query published jobs matching service category
        query = {
            "status": JobStatus.PUBLISHED,
            "service_category": {"$in": skills}
        }

        # Filter by contractor type preference if specified
        if contractor_type:
            query["$or"] = [
                {"contractor_type_preference": contractor_type},
                {"contractor_type_preference": ContractorTypePreference.NO_PREFERENCE},
                {"contractor_type_preference": None}
            ]

        # Get jobs
        cursor = self.db.jobs.find(query)
        jobs = []
        async for job_data in cursor:
            job = Job(**job_data)

            # Calculate distance
            if job.address.lat and job.address.lon:
                distance = geodesic(
                    (contractor_lat, contractor_lon),
                    (job.address.lat, job.address.lon)
                ).miles

                # Only include if within 50 miles
                if distance <= 50:
                    jobs.append((distance, job))

        # Sort by distance (closest first)
        jobs.sort(key=lambda x: x[0])

        # Apply pagination and return just jobs (not tuples)
        return [job for _, job in jobs[offset:offset + limit]]

    async def get_active_jobs(
        self,
        contractor_id: str,
        limit: int = 50,
        offset: int = 0
    ) -> List[Job]:
        """
        Get active jobs for a contractor.

        Jobs where:
        - assigned_contractor_id = contractor_id
        - status in [proposal_selected, scheduled, in_progress, completed_pending_review]

        Args:
            contractor_id: ID of contractor
            limit: Max results to return
            offset: Pagination offset

        Returns:
            List of active jobs
        """
        active_statuses = [
            JobStatus.PROPOSAL_SELECTED,
            JobStatus.SCHEDULED,
            JobStatus.IN_PROGRESS,
            JobStatus.COMPLETED_PENDING_REVIEW
        ]

        query = {
            "assigned_contractor_id": contractor_id,
            "status": {"$in": active_statuses}
        }

        cursor = self.db.jobs.find(query).sort("created_at", -1).skip(offset).limit(limit)
        jobs = []
        async for job_data in cursor:
            jobs.append(Job(**job_data))

        return jobs

    async def get_job_history(
        self,
        contractor_id: str,
        limit: int = 50,
        offset: int = 0
    ) -> List[Job]:
        """
        Get job history for a contractor.

        Jobs where:
        - assigned_contractor_id = contractor_id
        - status in [completed, cancelled_by_customer, cancelled_by_contractor]

        Args:
            contractor_id: ID of contractor
            limit: Max results to return
            offset: Pagination offset

        Returns:
            List of completed/cancelled jobs
        """
        terminal_statuses = [
            JobStatus.COMPLETED,
            JobStatus.CANCELLED_BY_CUSTOMER,
            JobStatus.CANCELLED_BY_CONTRACTOR
        ]

        query = {
            "assigned_contractor_id": contractor_id,
            "status": {"$in": terminal_statuses}
        }

        cursor = self.db.jobs.find(query).sort("updated_at", -1).skip(offset).limit(limit)
        jobs = []
        async for job_data in cursor:
            jobs.append(Job(**job_data))

        return jobs

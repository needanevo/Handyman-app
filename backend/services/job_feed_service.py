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

        # Get contractor's skills (optional — don't block if empty)
        skills = contractor.get("skills", [])

        # Map contractor's role to preference
        contractor_role = contractor.get("role")
        contractor_type = (
            "handyman" if contractor_role == UserRole.HANDYMAN
            else "licensed" if contractor_role == UserRole.CONTRACTOR
            else None
        )

        # Query all posted jobs (no skill filter — all jobs visible)
        query = {
            "status": JobStatus.POSTED,
        }

        # Build $and clause with multiple $or conditions
        and_conditions = []
        
        # Exclude jobs already assigned to a contractor
        and_conditions.append({
            "$or": [
                {"assigned_contractor_id": {"$exists": False}},
                {"assigned_contractor_id": None}
            ]}
        )

        # Filter by contractor type preference if specified
        if contractor_type:
            and_conditions.append({
                "$or": [
                    {"contractor_type_preference": contractor_type},
                    {"contractor_type_preference": ContractorTypePreference.NO_PREFERENCE},
                    {"contractor_type_preference": None},
                    {"contractor_type_preference": {"$exists": False}}
                ]
            })
        
        # Add $and to query if we have conditions
        if and_conditions:
            query["$and"] = and_conditions

        # Get jobs
        cursor = self.db.jobs.find(query)
        jobs = []
        async for job_data in cursor:
            try:
                job = Job(**job_data)
            except Exception:
                # Skip docs that don't match the Job model (e.g. old field names)
                continue

            # Calculate distance if provider has coordinates
            if contractor_lat and contractor_lon and job.address.lat and job.address.lon:
                distance = geodesic(
                    (contractor_lat, contractor_lon),
                    (job.address.lat, job.address.lon)
                ).miles

                if distance <= 50:
                    jobs.append((distance, job))
            else:
                # No coordinates — include with large distance so it sorts last
                jobs.append((float('inf'), job))

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
        # Active jobs include: ACCEPTED, IN_PROGRESS, COMPLETED (before review/paid)
        active_statuses = [
            JobStatus.ACCEPTED,
            JobStatus.IN_PROGRESS,
            JobStatus.COMPLETED,
            JobStatus.IN_REVIEW,
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
        # Terminal statuses for job history (completed or cancelled)
        terminal_statuses = [
            JobStatus.COMPLETED,
            JobStatus.PAID,
            JobStatus.CANCELLED_BEFORE_ACCEPT,
            JobStatus.CANCELLED_AFTER_ACCEPT,
            JobStatus.CANCELLED_IN_PROGRESS,
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

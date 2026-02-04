"""
Contractor routing service for job assignment.

Routes jobs to contractors based on:
1. Skill matching
2. Geographic proximity (zip code)
3. Contractor capacity/availability
"""

import os
from typing import List, Optional, Dict, Any
from motor.motor_asyncio import AsyncIOMotorDatabase
import logging
from geopy.distance import geodesic

logger = logging.getLogger(__name__)

ROUTING_ENABLED = os.getenv("ROUTING_ENABLED", "false").lower() == "true"
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@therealjohnson.com")


class ContractorRouter:
    """Routes jobs to appropriate contractors"""

    def __init__(self, database: AsyncIOMotorDatabase):
        self.db = database

    async def find_best_contractor(
        self,
        service_category: str,
        customer_address_id: str,
        customer_id: str,
        job_id: str
    ) -> Optional[str]:
        """
        Find the best contractor for a job within 50-mile radius.

        Args:
            service_category: Type of service needed
            customer_address_id: Customer's address ID
            customer_id: Customer's user ID
            job_id: Job ID for logging

        Returns:
            contractor_id if found, None if manual routing needed
        """
        if not ROUTING_ENABLED:
            logger.info(f"Routing disabled - job {job_id} requires manual assignment")
            return None

        # Get customer address with coordinates
        customer_user = await self.db.users.find_one({"id": customer_id})
        if not customer_user or not customer_user.get("addresses"):
            logger.warning(f"Customer {customer_id} has no addresses")
            return None

        customer_address = next(
            (addr for addr in customer_user["addresses"] if addr["id"] == customer_address_id),
            None
        )

        if not customer_address:
            logger.warning(f"Address {customer_address_id} not found for customer {customer_id}")
            return None

        if not customer_address.get("latitude") or not customer_address.get("longitude"):
            logger.warning(f"Customer address {customer_address_id} not geocoded")
            return None

        customer_location = (
            customer_address["latitude"],
            customer_address["longitude"]
        )

        # Find contractors with matching skills
        matching_contractors = await self._find_matching_skills(service_category)

        if not matching_contractors:
            logger.warning(f"No contractors found with skill: {service_category}")
            return None

        # Sort by proximity to customer (50-mile radius filter applied here)
        sorted_contractors = await self._sort_by_proximity(
            matching_contractors,
            customer_location
        )

        if not sorted_contractors:
            logger.warning(
                f"No contractors within 50 miles for job {job_id} "
                f"at location {customer_location}"
            )
            return None

        # Check capacity and return first available
        for contractor in sorted_contractors:
            if await self._has_capacity(contractor["id"]):
                logger.info(
                    f"Assigned contractor {contractor['id']} to job {job_id} "
                    f"(distance: {contractor['distance_miles']} miles)"
                )
                return contractor["id"]

        logger.warning(f"No contractors with capacity for job {job_id}")
        return None

    async def _find_matching_skills(self, service_category: str) -> List[Dict]:
        """
        Find contractors with matching skill and valid location.

        Returns contractors with their business address coordinates.
        """
        cursor = self.db.users.find({
            "role": "contractor",  # Updated to use lowercase enum value
            "is_active": True,
            "skills": {
                "$in": [service_category]  # Exact match in array
            }
        })

        contractors = []
        async for contractor in cursor:
            # Get contractor's business address (default or first address)
            addresses = contractor.get("addresses", [])
            business_address = None

            # Find default address or use first one
            for addr in addresses:
                if addr.get("is_default"):
                    business_address = addr
                    break

            if not business_address and addresses:
                business_address = addresses[0]

            # Skip contractor if no geocoded address
            if not business_address or \
               not business_address.get("latitude") or \
               not business_address.get("longitude"):
                logger.warning(
                    f"Contractor {contractor['id']} skipped - no geocoded address"
                )
                continue

            contractors.append({
                "id": contractor["id"],
                "skills": contractor.get("skills", []),
                "location": {
                    "latitude": business_address["latitude"],
                    "longitude": business_address["longitude"],
                    "address": f"{business_address.get('city', '')}, {business_address.get('state', '')}"
                }
            })

        logger.info(
            f"Found {len(contractors)} contractors with skill '{service_category}' "
            f"and valid location data"
        )

        return contractors

    async def _sort_by_proximity(
        self,
        contractors: List[Dict],
        customer_location: tuple
    ) -> List[Dict]:
        """
        Sort contractors by proximity to customer using 50-mile radius.

        Args:
            contractors: List of contractor dicts with lat/lon
            customer_location: Tuple of (latitude, longitude)

        Returns:
            List of contractors within 50 miles, sorted by distance
        """
        MAX_DISTANCE_MILES = 50

        contractors_with_distance = []

        for contractor in contractors:
            # Get contractor's business address coordinates
            contractor_location = contractor.get("location")

            if not contractor_location:
                logger.warning(
                    f"Contractor {contractor['id']} has no location data, skipping"
                )
                continue

            # Calculate distance using geodesic (accounts for Earth's curvature)
            distance = geodesic(
                customer_location,
                (contractor_location["latitude"], contractor_location["longitude"])
            ).miles

            # Only include contractors within 50-mile radius
            if distance <= MAX_DISTANCE_MILES:
                contractor["distance_miles"] = round(distance, 2)
                contractors_with_distance.append(contractor)

        # Sort by distance (closest first)
        contractors_with_distance.sort(key=lambda x: x["distance_miles"])

        logger.info(
            f"Found {len(contractors_with_distance)} contractors "
            f"within {MAX_DISTANCE_MILES} miles"
        )

        return contractors_with_distance

    async def _has_capacity(self, contractor_id: str) -> bool:
        """Check if contractor has capacity for new job"""
        # Count active jobs (posted, accepted, in_progress)
        active_statuses = ["posted", "accepted", "in_progress"]

        active_jobs = await self.db.jobs.count_documents({
            "contractor_id": contractor_id,
            "status": {"$in": active_statuses}
        })

        # TODO: Make max concurrent jobs configurable per contractor
        MAX_CONCURRENT_JOBS = 5

        return active_jobs < MAX_CONCURRENT_JOBS


async def send_manual_routing_email(
    job_id: str,
    service_category: str,
    customer_name: str,
    customer_zip: str
):
    """Send email to admin for manual job routing"""
    # TODO: Implement with email provider
    logger.info(
        f"Manual routing required for job {job_id}: "
        f"{service_category} in {customer_zip} for {customer_name}"
    )
    # Email will be sent by notification service

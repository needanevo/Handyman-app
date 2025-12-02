"""
GrowthService - Tracks contractor growth milestones and progression.

Emits growth events for:
- Job completions
- Revenue earned
- Reviews received
- Business milestones (LLC, license, insurance)

Updates growth summaries for dashboard display.
"""

from typing import Optional, List
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorDatabase

from models import (
    GrowthEvent, GrowthEventType, GrowthSummary,
    ContractorGrowthRole, LLCStatus, DocumentStatus,
    UserRole
)


class GrowthService:
    """Manages growth event tracking and summary calculations"""

    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db

    async def emit_event(
        self,
        user_id: str,
        role: UserRole,
        event_type: GrowthEventType,
        value: float,
        meta: Optional[dict] = None
    ):
        """
        Emit a growth event and update summary.

        Args:
            user_id: ID of contractor
            role: User role (HANDYMAN or TECHNICIAN)
            event_type: Type of event
            value: Numeric value (revenue, rating, or 1 for boolean events)
            meta: Optional metadata (job_id, review_id, etc.)
        """
        # Map UserRole to ContractorGrowthRole
        growth_role = (
            ContractorGrowthRole.HANDYMAN if role == UserRole.HANDYMAN
            else ContractorGrowthRole.CONTRACTOR
        )

        # Create event
        event = GrowthEvent(
            user_id=user_id,
            role=growth_role,
            type=event_type,
            value=value,
            meta=meta or {}
        )

        # Insert event
        event_dict = event.model_dump()
        await self.db.growth_events.insert_one(event_dict)

        # Update summary
        await self._update_summary(user_id, growth_role)

    async def _update_summary(self, user_id: str, role: ContractorGrowthRole):
        """
        Update growth summary for a contractor.

        Recalculates from all events for this user.
        """
        # Get all events for user
        cursor = self.db.growth_events.find({"user_id": user_id})

        total_jobs_completed = 0
        total_revenue = 0.0
        rating_sum = 0.0
        rating_count = 0
        five_star_count = 0
        four_star_count = 0
        llc_status = LLCStatus.NONE
        license_status = DocumentStatus.NONE
        insurance_status = DocumentStatus.NONE

        async for event_data in cursor:
            event_type = event_data["type"]
            value = event_data["value"]

            if event_type == GrowthEventType.JOB_COMPLETED:
                total_jobs_completed += int(value)

            elif event_type == GrowthEventType.REVENUE_EARNED:
                total_revenue += value

            elif event_type == GrowthEventType.FIVE_STAR_REVIEW:
                rating_sum += 5.0
                rating_count += 1
                five_star_count += 1

            elif event_type == GrowthEventType.FOUR_STAR_REVIEW:
                rating_sum += 4.0
                rating_count += 1
                four_star_count += 1

            elif event_type == GrowthEventType.LLC_LINKED:
                llc_status = LLCStatus.COMPLETED

            elif event_type == GrowthEventType.LICENSE_UPLOADED:
                license_status = DocumentStatus.UPLOADED

            elif event_type == GrowthEventType.INSURANCE_UPLOADED:
                insurance_status = DocumentStatus.UPLOADED

        # Calculate average rating
        average_rating = (rating_sum / rating_count) if rating_count > 0 else 0.0

        # Get existing summary or create new one
        existing_summary = await self.db.growth_summary.find_one({"user_id": user_id})

        summary_data = {
            "user_id": user_id,
            "role": role,
            "total_jobs_completed": total_jobs_completed,
            "total_revenue": total_revenue,
            "average_rating": average_rating,
            "five_star_count": five_star_count,
            "four_star_count": four_star_count,
            "llc_status": llc_status,
            "license_status": license_status,
            "insurance_status": insurance_status,
            "last_updated_at": datetime.utcnow()
        }

        if existing_summary:
            # Update existing
            await self.db.growth_summary.update_one(
                {"user_id": user_id},
                {"$set": summary_data}
            )
        else:
            # Insert new
            summary = GrowthSummary(**summary_data)
            await self.db.growth_summary.insert_one(summary.model_dump())

    async def get_summary(self, user_id: str) -> Optional[GrowthSummary]:
        """
        Get growth summary for a contractor.

        Args:
            user_id: ID of contractor

        Returns:
            GrowthSummary or None if not found
        """
        summary_data = await self.db.growth_summary.find_one({"user_id": user_id})
        if not summary_data:
            return None

        return GrowthSummary(**summary_data)

    async def get_events(
        self,
        user_id: str,
        limit: int = 50,
        offset: int = 0
    ) -> List[GrowthEvent]:
        """
        Get paginated growth events for a contractor.

        Args:
            user_id: ID of contractor
            limit: Max results
            offset: Pagination offset

        Returns:
            List of growth events, newest first
        """
        cursor = self.db.growth_events.find(
            {"user_id": user_id}
        ).sort("created_at", -1).skip(offset).limit(limit)

        events = []
        async for event_data in cursor:
            events.append(GrowthEvent(**event_data))

        return events

    # Helper methods to emit specific events

    async def emit_job_completed(self, user_id: str, role: UserRole, job_id: str, revenue: float):
        """Emit job completion and revenue events"""
        await self.emit_event(
            user_id, role, GrowthEventType.JOB_COMPLETED, 1.0,
            meta={"job_id": job_id}
        )
        await self.emit_event(
            user_id, role, GrowthEventType.REVENUE_EARNED, revenue,
            meta={"job_id": job_id}
        )

    async def emit_review(self, user_id: str, role: UserRole, rating: int, review_id: str):
        """Emit review event"""
        if rating == 5:
            event_type = GrowthEventType.FIVE_STAR_REVIEW
        elif rating == 4:
            event_type = GrowthEventType.FOUR_STAR_REVIEW
        else:
            # Only track 4 and 5 star reviews for now
            return

        await self.emit_event(
            user_id, role, event_type, float(rating),
            meta={"review_id": review_id, "rating": rating}
        )

    async def emit_llc_linked(self, user_id: str, role: UserRole):
        """Emit LLC formation event"""
        await self.emit_event(user_id, role, GrowthEventType.LLC_LINKED, 1.0)

    async def emit_license_uploaded(self, user_id: str, role: UserRole):
        """Emit license upload event"""
        await self.emit_event(user_id, role, GrowthEventType.LICENSE_UPLOADED, 1.0)

    async def emit_insurance_uploaded(self, user_id: str, role: UserRole):
        """Emit insurance upload event"""
        await self.emit_event(user_id, role, GrowthEventType.INSURANCE_UPLOADED, 1.0)

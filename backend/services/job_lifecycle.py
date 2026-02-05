"""
JobLifecycleService - State machine for job status transitions.

This is the ONLY place where job status changes should be applied.
Enforces allowed transitions and handles side effects.

Provider Assignment:
- assigned_provider_id is the canonical field for provider assignment
- Legacy fields (contractor_id, assigned_contractor_id) are kept for backward compatibility
- Use get_assigned_provider_id() and set_assigned_provider_id() helpers
"""

from typing import Optional, Dict, Any
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorDatabase

from models import Job, JobStatus, Payout, PayoutStatus, PayoutProvider
from models.job import serialize_mongo_doc


class JobLifecycleError(Exception):
    """Raised when an invalid state transition is attempted"""
    pass


def get_assigned_provider_id(job: dict) -> Optional[str]:
    """
    Get the assigned provider ID from a job document.
    
    Returns the first non-null value from:
    1. assigned_provider_id (canonical)
    2. assigned_contractor_id (legacy)
    3. contractor_id (legacy)
    """
    return job.get('assigned_provider_id') or \
           job.get('assigned_contractor_id') or \
           job.get('contractor_id')


def set_assigned_provider_id(job_id: str, provider_id: str) -> dict:
    """
    Generate update dict that sets provider assignment on all fields.
    
    This ensures backward compatibility with legacy fields.
    """
    now = datetime.utcnow().isoformat()
    return {
        "$set": {
            "assigned_provider_id": provider_id,
            "assigned_contractor_id": provider_id,  # Legacy
            "contractor_id": provider_id,  # Legacy
            "updated_at": now
        }
    }


class JobLifecycleService:
    """
    Manages job status transitions and side effects.

    Simplified Job Lifecycle:
    1. draft -> posted (customer)
    2. posted -> accepted (provider) - provider claims the job
    3. accepted -> in_progress (provider)
    4. in_progress -> completed (provider)
    5. completed -> in_review (customer)
    6. in_review -> paid (admin/customer)
    
    Cancellation paths:
    - posted -> cancelled_before_accept (customer)
    - accepted -> cancelled_after_accept (customer or provider)
    - in_progress -> cancelled_in_progress (customer or provider)
    """

    # Define allowed transitions
    TRANSITIONS = {
        JobStatus.DRAFT: [JobStatus.POSTED, JobStatus.CANCELLED_BEFORE_ACCEPT],
        JobStatus.POSTED: [JobStatus.ACCEPTED, JobStatus.CANCELLED_BEFORE_ACCEPT],
        JobStatus.ACCEPTED: [JobStatus.SCHEDULED, JobStatus.IN_PROGRESS, JobStatus.CANCELLED_AFTER_ACCEPT],
        JobStatus.SCHEDULED: [JobStatus.IN_PROGRESS, JobStatus.CANCELLED_AFTER_ACCEPT],
        JobStatus.IN_PROGRESS: [JobStatus.COMPLETED, JobStatus.CANCELLED_IN_PROGRESS],
        JobStatus.COMPLETED: [JobStatus.IN_REVIEW],
        JobStatus.IN_REVIEW: [JobStatus.PAID],
        JobStatus.PAID: [],  # Terminal state
        JobStatus.CANCELLED_BEFORE_ACCEPT: [],  # Terminal state
        JobStatus.CANCELLED_AFTER_ACCEPT: [],  # Terminal state
        JobStatus.CANCELLED_IN_PROGRESS: [],  # Terminal state
    }

    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db

    async def apply_transition(
        self,
        job_id: str,
        new_status: JobStatus,
        actor_id: str,
        actor_role: str,
        additional_data: Optional[Dict[str, Any]] = None
    ) -> dict:
        """
        Apply a status transition to a job.

        Args:
            job_id: ID of job to transition
            new_status: Desired new status
            actor_id: ID of user making the change
            actor_role: Role of user (customer, handyman, contractor, admin)
            additional_data: Optional dict with fields like scheduled_start, etc.

        Returns:
            Updated job document (dict)

        Raises:
            JobLifecycleError: If transition is not allowed
        """
        # Fetch current job
        job = await self.db.jobs.find_one({"id": job_id})
        if not job:
            raise JobLifecycleError(f"Job {job_id} not found")

        current_status = JobStatus.from_string(job.get("status", "draft"))

        # Validate transition is allowed
        if new_status not in self.TRANSITIONS.get(current_status, []):
            raise JobLifecycleError(
                f"Cannot transition from {current_status.value} to {new_status.value}"
            )

        # Prepare update data
        update_data = {
            "status": new_status.value,
            "updated_at": datetime.utcnow().isoformat()
        }

        # Apply side effects based on transition
        if new_status == JobStatus.POSTED:
            # Job enters matching queue - no additional action
            pass

        elif new_status == JobStatus.ACCEPTED:
            # Provider accepts job - must have provider_id
            if not additional_data or "provider_id" not in additional_data:
                raise JobLifecycleError("provider_id required for accepted status")

            provider_id = additional_data["provider_id"]
            # Set canonical provider ID and legacy fields
            update_data["assigned_provider_id"] = provider_id
            update_data["assigned_contractor_id"] = provider_id  # Legacy
            update_data["contractor_id"] = provider_id  # Legacy
            update_data["accepted_at"] = datetime.utcnow().isoformat()

        elif new_status == JobStatus.SCHEDULED:
            # Job scheduled for a specific date
            update_data["scheduled_date"] = additional_data.get("scheduled_date") if additional_data else None
            update_data["scheduled_at"] = datetime.utcnow().isoformat()

        elif new_status == JobStatus.IN_PROGRESS:
            # Provider marked "On the job"
            update_data["started_at"] = datetime.utcnow().isoformat()

        elif new_status == JobStatus.COMPLETED:
            # Provider marked work complete - create payout
            provider_id = get_assigned_provider_id(job)
            payout = await self._create_payout_for_job(job_id, provider_id)
            update_data["payout_id"] = payout.id
            update_data["completed_at"] = datetime.utcnow().isoformat()

        elif new_status == JobStatus.PAID:
            # Payment processed - queue payout for transfer
            payout_id = job.get("payout_id")
            if payout_id:
                await self._queue_payout_for_transfer(payout_id)

        elif new_status in [
            JobStatus.CANCELLED_BEFORE_ACCEPT,
            JobStatus.CANCELLED_AFTER_ACCEPT,
            JobStatus.CANCELLED_IN_PROGRESS
        ]:
            # Job cancelled - record cancellation
            update_data["cancelled_at"] = datetime.utcnow().isoformat()
            if additional_data and "cancellation_reason" in additional_data:
                update_data["cancellation_reason"] = additional_data["cancellation_reason"]
            if additional_data and "cancelled_by" in additional_data:
                update_data["cancelled_by"] = additional_data["cancelled_by"]

        # Update job in database
        await self.db.jobs.update_one(
            {"id": job_id},
            {"$set": update_data}
        )

        # Fetch and return updated job
        updated_job = await self.db.jobs.find_one({"id": job_id})
        return serialize_mongo_doc(updated_job)

    async def _create_payout_for_job(self, job_id: str, provider_id: str) -> Payout:
        """
        Create a payout when job is completed.
        Platform fee is 15% of gross amount.
        """
        # Get job to find the amount
        job = await self.db.jobs.find_one({"id": job_id})
        if not job:
            raise JobLifecycleError(f"Job {job_id} not found")

        # Get accepted proposal to determine amount
        proposal = await self.db.proposals.find_one({
            "id": job.get("accepted_proposal_id")
        })

        amount_gross = proposal.get("quoted_price", 0) if proposal else job.get("budget_max", 0)
        platform_fee_amount = amount_gross * 0.15
        amount_net = amount_gross - platform_fee_amount

        payout = Payout(
            job_id=job_id,
            contractor_id=provider_id,
            amount_gross=amount_gross,
            platform_fee_amount=platform_fee_amount,
            amount_net=amount_net,
            status=PayoutStatus.PENDING,
            provider=PayoutProvider.PLACEHOLDER
        )

        # Insert payout
        payout_dict = payout.model_dump()
        await self.db.payouts.insert_one(payout_dict)

        return payout

    async def _queue_payout_for_transfer(self, payout_id: str):
        """
        Move payout to queued_for_transfer status.
        Background worker will process payment.
        """
        await self.db.payouts.update_one(
            {"id": payout_id},
            {
                "$set": {
                    "status": PayoutStatus.QUEUED_FOR_TRANSFER,
                    "updated_at": datetime.utcnow()
                }
            }
        )

"""
JobLifecycleService - State machine for job status transitions.

This is the ONLY place where job status changes should be applied.
Enforces allowed transitions and handles side effects.
"""

from typing import Optional, Dict, Any
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorDatabase

from models import Job, JobStatus, Payout, PayoutStatus, PayoutProvider


class JobLifecycleError(Exception):
    """Raised when an invalid state transition is attempted"""
    pass


class JobLifecycleService:
    """
    Manages job status transitions and side effects.

    Allowed transitions (actor → status):
    1. draft → published (customer)
    2. published → proposal_selected (customer)
    3. proposal_selected → scheduled (contractor)
    4. scheduled → in_progress (contractor)
    5. in_progress → completed_pending_review (contractor)
    6. completed_pending_review → completed (customer or auto)
    7. any_active → cancelled_by_customer (customer)
    8. any_active → cancelled_by_contractor (contractor)
    """

    # Define allowed transitions
    TRANSITIONS = {
        JobStatus.DRAFT: [JobStatus.PUBLISHED, JobStatus.CANCELLED_BY_CUSTOMER],
        JobStatus.PUBLISHED: [JobStatus.PROPOSAL_SELECTED, JobStatus.CANCELLED_BY_CUSTOMER],
        JobStatus.PROPOSAL_SELECTED: [JobStatus.SCHEDULED, JobStatus.CANCELLED_BY_CUSTOMER, JobStatus.CANCELLED_BY_CONTRACTOR],
        JobStatus.SCHEDULED: [JobStatus.IN_PROGRESS, JobStatus.CANCELLED_BY_CUSTOMER, JobStatus.CANCELLED_BY_CONTRACTOR],
        JobStatus.IN_PROGRESS: [JobStatus.COMPLETED_PENDING_REVIEW, JobStatus.CANCELLED_BY_CUSTOMER, JobStatus.CANCELLED_BY_CONTRACTOR],
        JobStatus.COMPLETED_PENDING_REVIEW: [JobStatus.COMPLETED, JobStatus.CANCELLED_BY_CUSTOMER],
        JobStatus.COMPLETED: [],  # Terminal state
        JobStatus.CANCELLED_BY_CUSTOMER: [],  # Terminal state
        JobStatus.CANCELLED_BY_CONTRACTOR: [],  # Terminal state
    }

    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db

    async def apply_transition(
        self,
        job: Job,
        new_status: JobStatus,
        actor_id: str,
        actor_role: str,
        additional_data: Optional[Dict[str, Any]] = None
    ) -> Job:
        """
        Apply a status transition to a job.

        Args:
            job: Current job object
            new_status: Desired new status
            actor_id: ID of user making the change
            actor_role: Role of user (customer, handyman, contractor, admin)
            additional_data: Optional dict with fields like scheduled_start, scheduled_end, etc.

        Returns:
            Updated job object

        Raises:
            JobLifecycleError: If transition is not allowed
        """
        # Validate transition is allowed
        if new_status not in self.TRANSITIONS.get(job.status, []):
            raise JobLifecycleError(
                f"Cannot transition from {job.status} to {new_status}"
            )

        # Prepare update data
        update_data = {
            "status": new_status,
            "updated_at": datetime.utcnow()
        }

        # Apply side effects based on transition
        if new_status == JobStatus.PUBLISHED:
            # Job enters matching queue (no additional action needed here)
            pass

        elif new_status == JobStatus.PROPOSAL_SELECTED:
            # Customer selected a proposal - must have accepted_proposal_id
            if not additional_data or "accepted_proposal_id" not in additional_data:
                raise JobLifecycleError("accepted_proposal_id required for proposal_selected status")
            if not additional_data or "assigned_contractor_id" not in additional_data:
                raise JobLifecycleError("assigned_contractor_id required for proposal_selected status")

            update_data["accepted_proposal_id"] = additional_data["accepted_proposal_id"]
            update_data["assigned_contractor_id"] = additional_data["assigned_contractor_id"]

            # Update proposal statuses (accept one, reject others)
            await self._update_proposals_for_job(
                job.id,
                accepted_proposal_id=additional_data["accepted_proposal_id"]
            )

        elif new_status == JobStatus.SCHEDULED:
            # Contractor confirmed schedule
            if additional_data:
                if "scheduled_start" in additional_data:
                    update_data["scheduled_start"] = additional_data["scheduled_start"]
                if "scheduled_end" in additional_data:
                    update_data["scheduled_end"] = additional_data["scheduled_end"]

        elif new_status == JobStatus.IN_PROGRESS:
            # Contractor marked "On the job"
            pass

        elif new_status == JobStatus.COMPLETED_PENDING_REVIEW:
            # Contractor marked "Work finished" - create payout
            payout = await self._create_payout_for_job(job)
            update_data["payout_id"] = payout.id

        elif new_status == JobStatus.COMPLETED:
            # Customer confirmed OR auto after N days - queue payout
            if job.payout_id:
                await self._queue_payout_for_transfer(job.payout_id)

        elif new_status in [JobStatus.CANCELLED_BY_CUSTOMER, JobStatus.CANCELLED_BY_CONTRACTOR]:
            # Job cancelled - handle any cleanup
            pass

        # Update job in database
        await self.db.jobs.update_one(
            {"id": job.id},
            {"$set": update_data}
        )

        # Refresh job object
        updated_job_data = await self.db.jobs.find_one({"id": job.id})
        if not updated_job_data:
            raise JobLifecycleError(f"Job {job.id} not found after update")

        # Convert to Job model
        updated_job = Job(**updated_job_data)

        return updated_job

    async def _update_proposals_for_job(self, job_id: str, accepted_proposal_id: str):
        """
        Update proposals: mark one accepted, others rejected.
        """
        # Accept the selected proposal
        await self.db.proposals.update_one(
            {"id": accepted_proposal_id, "job_id": job_id},
            {
                "$set": {
                    "status": "accepted",
                    "updated_at": datetime.utcnow()
                }
            }
        )

        # Reject all other pending proposals for this job
        await self.db.proposals.update_many(
            {
                "job_id": job_id,
                "id": {"$ne": accepted_proposal_id},
                "status": "pending"
            },
            {
                "$set": {
                    "status": "rejected",
                    "updated_at": datetime.utcnow()
                }
            }
        )

    async def _create_payout_for_job(self, job: Job) -> Payout:
        """
        Create a payout when job is completed_pending_review.
        Platform fee is 15% of gross amount.
        """
        # Get the accepted proposal to determine amount
        proposal = await self.db.proposals.find_one({
            "id": job.accepted_proposal_id
        })

        if not proposal:
            raise JobLifecycleError(f"Accepted proposal {job.accepted_proposal_id} not found")

        amount_gross = proposal["quoted_price"]
        platform_fee_amount = amount_gross * 0.15
        amount_net = amount_gross - platform_fee_amount

        payout = Payout(
            job_id=job.id,
            contractor_id=job.assigned_contractor_id,
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
        Background worker will pick this up and process payment.
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

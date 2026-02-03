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
    1. draft → posted (customer)
    2. posted → accepted (contractor)
    3. accepted → in_progress (contractor)
    4. in_progress → completed (contractor)
    5. completed → in_review (auto)
    6. in_review → paid (system/customer)
    7. posted → cancelled_before_accept (customer)
    8. accepted → cancelled_after_accept (customer or contractor)
    9. in_progress → cancelled_in_progress (customer or contractor)
    """

    # Define allowed transitions - Updated 2026-02-03
    TRANSITIONS = {
        JobStatus.DRAFT: [JobStatus.POSTED, JobStatus.CANCELLED_BEFORE_ACCEPT],
        JobStatus.POSTED: [JobStatus.ACCEPTED, JobStatus.CANCELLED_BEFORE_ACCEPT],
        JobStatus.ACCEPTED: [JobStatus.IN_PROGRESS, JobStatus.CANCELLED_AFTER_ACCEPT],
        JobStatus.IN_PROGRESS: [JobStatus.COMPLETED, JobStatus.CANCELLED_IN_PROGRESS],
        JobStatus.COMPLETED: [JobStatus.IN_REVIEW],  # Auto-transitions to review
        JobStatus.IN_REVIEW: [JobStatus.PAID],  # Customer approves, payment processed
        JobStatus.PAID: [],  # Terminal state
        # Cancellation states are terminal
        JobStatus.CANCELLED_BEFORE_ACCEPT: [],
        JobStatus.CANCELLED_AFTER_ACCEPT: [],
        JobStatus.CANCELLED_IN_PROGRESS: [],
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
        if new_status == JobStatus.POSTED:
            # Job enters matching queue (no additional action needed here)
            pass

        elif new_status == JobStatus.ACCEPTED:
            # Contractor accepted the job - must have assigned_contractor_id
            if not additional_data or "assigned_contractor_id" not in additional_data:
                raise JobLifecycleError("assigned_contractor_id required for accepted status")
            update_data["assigned_contractor_id"] = additional_data["assigned_contractor_id"]

        elif new_status == JobStatus.IN_PROGRESS:
            # Contractor marked "On the job"
            pass

        elif new_status == JobStatus.COMPLETED:
            # Contractor marked "Work finished" - create payout
            payout = await self._create_payout_for_job(job)
            update_data["payout_id"] = payout.id

        elif new_status == JobStatus.IN_REVIEW:
            # Job is being reviewed - no action needed
            pass

        elif new_status == JobStatus.PAID:
            # Payment processed - job lifecycle complete
            pass

        elif new_status in [JobStatus.CANCELLED_BEFORE_ACCEPT, JobStatus.CANCELLED_AFTER_ACCEPT, JobStatus.CANCELLED_IN_PROGRESS]:
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

"""
ProposalService - Handles proposal creation and validation.

Enforces business rules:
- Only handyman/contractor roles can create proposals
- Only when job status = published
- One provider can have at most one active proposal per job
"""

from typing import Optional
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorDatabase

from models import (
    Proposal, ProposalCreateRequest, ProposalStatus,
    ContractorRole, JobStatus, UserRole
)


class ProposalError(Exception):
    """Raised when proposal creation/update fails validation"""
    pass


class ProposalService:
    """Manages proposal creation and lifecycle"""

    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db

    async def create_proposal(
        self,
        job_id: str,
        contractor_id: str,
        contractor_role: UserRole,
        proposal_request: ProposalCreateRequest
    ) -> Proposal:
        """
        Create a new proposal for a job.

        Args:
            job_id: Job to propose for
            contractor_id: ID of contractor submitting proposal
            contractor_role: Role of contractor (HANDYMAN or TECHNICIAN)
            proposal_request: Proposal details

        Returns:
            Created proposal

        Raises:
            ProposalError: If validation fails
        """
        # Validate contractor role
        if contractor_role not in [UserRole.HANDYMAN, UserRole.TECHNICIAN]:
            raise ProposalError("Only handymen and contractors can submit proposals")

        # Get job and validate it's published
        job = await self.db.jobs.find_one({"id": job_id})
        if not job:
            raise ProposalError(f"Job {job_id} not found")

        if job["status"] != JobStatus.PUBLISHED:
            raise ProposalError(f"Job must be published to accept proposals (current status: {job['status']})")

        # Check for existing active proposal from this contractor
        existing_proposal = await self.db.proposals.find_one({
            "job_id": job_id,
            "contractor_id": contractor_id,
            "status": {"$in": ["pending", "accepted"]}
        })

        if existing_proposal:
            raise ProposalError(f"You already have an active proposal for this job")

        # Map UserRole to ContractorRole for proposal
        contractor_role_mapped = (
            ContractorRole.HANDYMAN if contractor_role == UserRole.HANDYMAN
            else ContractorRole.CONTRACTOR
        )

        # Create proposal
        proposal = Proposal(
            job_id=job_id,
            contractor_id=contractor_id,
            contractor_role=contractor_role_mapped,
            quoted_price=proposal_request.quoted_price,
            estimated_duration=proposal_request.estimated_duration,
            proposed_start=proposal_request.proposed_start,
            message=proposal_request.message,
            status=ProposalStatus.PENDING
        )

        # Insert to database
        proposal_dict = proposal.model_dump()
        await self.db.proposals.insert_one(proposal_dict)

        return proposal

    async def withdraw_proposal(
        self,
        proposal_id: str,
        contractor_id: str
    ) -> Proposal:
        """
        Withdraw a proposal (only by owning contractor).

        Args:
            proposal_id: Proposal to withdraw
            contractor_id: ID of contractor who owns the proposal

        Returns:
            Updated proposal

        Raises:
            ProposalError: If validation fails
        """
        # Get proposal
        proposal_data = await self.db.proposals.find_one({"id": proposal_id})
        if not proposal_data:
            raise ProposalError(f"Proposal {proposal_id} not found")

        # Verify ownership
        if proposal_data["contractor_id"] != contractor_id:
            raise ProposalError("You can only withdraw your own proposals")

        # Verify status is pending
        if proposal_data["status"] != ProposalStatus.PENDING:
            raise ProposalError(f"Cannot withdraw proposal with status {proposal_data['status']}")

        # Update status
        await self.db.proposals.update_one(
            {"id": proposal_id},
            {
                "$set": {
                    "status": ProposalStatus.WITHDRAWN,
                    "updated_at": datetime.utcnow()
                }
            }
        )

        # Return updated proposal
        updated_proposal_data = await self.db.proposals.find_one({"id": proposal_id})
        return Proposal(**updated_proposal_data)

    async def get_proposals_for_job(
        self,
        job_id: str,
        customer_id: str
    ) -> list[Proposal]:
        """
        Get all proposals for a job (customer-only).

        Args:
            job_id: Job to get proposals for
            customer_id: ID of customer who owns the job

        Returns:
            List of proposals

        Raises:
            ProposalError: If validation fails
        """
        # Verify customer owns the job
        job = await self.db.jobs.find_one({"id": job_id})
        if not job:
            raise ProposalError(f"Job {job_id} not found")

        if job["customer_id"] != customer_id:
            raise ProposalError("You can only view proposals for your own jobs")

        # Get proposals
        cursor = self.db.proposals.find({"job_id": job_id})
        proposals = []
        async for proposal_data in cursor:
            proposals.append(Proposal(**proposal_data))

        return proposals

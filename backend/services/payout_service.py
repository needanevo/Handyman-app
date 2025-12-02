"""
PayoutService - Handles payout calculations and wallet queries.

Note: Payout creation is done by JobLifecycleService when job is completed.
This service handles:
- Wallet summary calculations
- Payout queries
- Background worker to process queued payouts
"""

from typing import List, Optional
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorDatabase

from models import Payout, PayoutStatus, WalletSummary


class PayoutService:
    """Manages payout queries and wallet calculations"""

    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db

    async def get_wallet_summary(self, contractor_id: str) -> WalletSummary:
        """
        Calculate wallet summary for a contractor.

        Returns:
            WalletSummary with lifetime_earnings, available, pending
        """
        # Get all payouts for contractor
        cursor = self.db.payouts.find({"contractor_id": contractor_id})

        lifetime_earnings = 0.0
        available = 0.0
        pending = 0.0
        last_payout_date = None

        async for payout_data in cursor:
            status = payout_data["status"]
            amount_net = payout_data["amount_net"]

            # Lifetime earnings = paid + queued
            if status in [PayoutStatus.PAID, PayoutStatus.QUEUED_FOR_TRANSFER]:
                lifetime_earnings += amount_net

            # Available = queued for transfer
            if status == PayoutStatus.QUEUED_FOR_TRANSFER:
                available += amount_net

            # Pending = waiting for job completion
            if status == PayoutStatus.PENDING:
                pending += amount_net

            # Track last payout date
            if status == PayoutStatus.PAID:
                payout_date = payout_data.get("updated_at")
                if payout_date:
                    if not last_payout_date or payout_date > last_payout_date:
                        last_payout_date = payout_date

        return WalletSummary(
            lifetime_earnings=lifetime_earnings,
            available=available,
            pending=pending,
            last_payout_date=last_payout_date
        )

    async def get_payouts(
        self,
        contractor_id: str,
        limit: int = 50,
        offset: int = 0
    ) -> List[Payout]:
        """
        Get paginated list of payouts for a contractor.

        Args:
            contractor_id: ID of contractor
            limit: Max results
            offset: Pagination offset

        Returns:
            List of payouts, newest first
        """
        cursor = self.db.payouts.find(
            {"contractor_id": contractor_id}
        ).sort("created_at", -1).skip(offset).limit(limit)

        payouts = []
        async for payout_data in cursor:
            payouts.append(Payout(**payout_data))

        return payouts

    async def process_queued_payouts(self) -> dict:
        """
        Background worker stub to process queued payouts.

        In production, this would:
        1. Query payouts with status=queued_for_transfer
        2. Call payment provider (Stripe) to transfer funds
        3. Update status to paid or failed

        For now, this is a placeholder that just marks them as paid.

        Returns:
            Dict with processing stats
        """
        # Get queued payouts
        cursor = self.db.payouts.find({"status": PayoutStatus.QUEUED_FOR_TRANSFER})

        processed_count = 0
        failed_count = 0

        async for payout_data in cursor:
            payout_id = payout_data["id"]

            # TODO: Call payment provider here
            # For now, just mark as paid
            try:
                await self.db.payouts.update_one(
                    {"id": payout_id},
                    {
                        "$set": {
                            "status": PayoutStatus.PAID,
                            "updated_at": datetime.utcnow(),
                            "provider_payout_id": f"placeholder_{payout_id}"
                        }
                    }
                )
                processed_count += 1
            except Exception as e:
                # Mark as failed
                await self.db.payouts.update_one(
                    {"id": payout_id},
                    {
                        "$set": {
                            "status": PayoutStatus.FAILED,
                            "updated_at": datetime.utcnow(),
                            "failure_reason": str(e)
                        }
                    }
                )
                failed_count += 1

        return {
            "processed": processed_count,
            "failed": failed_count,
            "timestamp": datetime.utcnow().isoformat()
        }

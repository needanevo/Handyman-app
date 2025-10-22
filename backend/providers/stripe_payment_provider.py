import os
from typing import Dict, Any, Optional
import stripe
from .base import PaymentProvider, PaymentIntent, ProviderError

class StripePaymentProvider(PaymentProvider):
    def __init__(self):
        api_key = os.getenv("STRIPE_SECRET_KEY")
        if not api_key:
            raise ProviderError("STRIPE_SECRET_KEY missing")
        stripe.api_key = api_key
        self.webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")
    
    async def create_payment_intent(self, amount: int, currency: str = "usd", metadata: Dict[str, Any] = None) -> PaymentIntent:
        try:
            intent = stripe.PaymentIntent.create(amount=amount, currency=currency, metadata=metadata or {}, automatic_payment_methods={'enabled': True})
            return PaymentIntent(id=intent.id, amount=intent.amount, currency=intent.currency, status=intent.status, client_secret=intent.client_secret)
        except stripe.error.StripeError as e:
            raise ProviderError(f"Stripe payment intent creation failed: {str(e)}")
    
    async def confirm_payment(self, payment_intent_id: str) -> PaymentIntent:
        try:
            intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            if intent.status == 'requires_confirmation':
                intent = stripe.PaymentIntent.confirm(payment_intent_id)
            return PaymentIntent(id=intent.id, amount=intent.amount, currency=intent.currency, status=intent.status, client_secret=intent.client_secret)
        except stripe.error.StripeError as e:
            raise ProviderError(f"Stripe payment confirmation failed: {str(e)}")
    
    async def refund_payment(self, payment_intent_id: str, amount: Optional[int] = None) -> Dict[str, Any]:
        try:
            refund_params = {'payment_intent': payment_intent_id}
            if amount is not None:
                refund_params['amount'] = amount
            refund = stripe.Refund.create(**refund_params)
            return {'id': refund.id, 'payment_intent': refund.payment_intent, 'amount': refund.amount, 'status': refund.status, 'created': refund.created}
        except stripe.error.StripeError as e:
            raise ProviderError(f"Stripe refund failed: {str(e)}")

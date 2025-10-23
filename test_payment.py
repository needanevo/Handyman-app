import asyncio
import os
import sys

sys.path.insert(0, '/srv/handyman-app/Handyman-app-main')

from dotenv import load_dotenv
load_dotenv('backend/providers/providers.env')

from backend.providers import PAYMENT_PROVIDERS

async def test_payment():
    print(f"Available payment providers: {list(PAYMENT_PROVIDERS.keys())}")
    
    active = os.getenv('ACTIVE_PAYMENT_PROVIDER', 'mock')
    print(f"Active provider: {active}")
    
    if 'stripe' not in PAYMENT_PROVIDERS:
        print("❌ Stripe not available!")
        return
    
    provider_class = PAYMENT_PROVIDERS['stripe']
    provider = provider_class()
    
    print("\n💳 Testing Stripe Payment Intent Creation...")
    print("Creating a $50.00 payment intent...")
    
    try:
        # Create a payment intent for $50.00
        payment_intent = await provider.create_payment_intent(
            amount=5000,  # $50.00 in cents
            currency="usd",
            metadata={
                "customer_name": "Test Customer",
                "service": "Plumbing Repair",
                "job_id": "TEST123"
            }
        )
        
        print(f"\n✅ Payment Intent Created Successfully!")
        print(f"   ID: {payment_intent.id}")
        print(f"   Amount: ${payment_intent.amount / 100:.2f}")
        print(f"   Currency: {payment_intent.currency.upper()}")
        print(f"   Status: {payment_intent.status}")
        print(f"   Client Secret: {payment_intent.client_secret[:20]}...")
        
        print(f"\n📝 You can view this in Stripe Dashboard:")
        print(f"   https://dashboard.stripe.com/test/payments/{payment_intent.id}")
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_payment())

import asyncio
import os
import sys

sys.path.insert(0, '/srv/handyman-app/Handyman-app-main')

from dotenv import load_dotenv
load_dotenv('backend/providers/providers.env')

from backend.providers import SMS_PROVIDERS
from backend.providers.base import SmsMessage

async def test_sms():
    print(f"Available SMS providers: {list(SMS_PROVIDERS.keys())}")
    
    active = os.getenv('ACTIVE_SMS_PROVIDER', 'mock')
    print(f"Active provider: {active}")
    
    from_number = os.getenv('TWILIO_FROM_NUMBER')
    print(f"From number: {from_number}")
    
    if 'twilio' not in SMS_PROVIDERS:
        print("❌ Twilio not available!")
        return
    
    provider_class = SMS_PROVIDERS['twilio']
    provider = provider_class()
    
    message = SmsMessage(
        to="+14433073434",
        message="🎉 Test SMS from The Real Johnson! Your Twilio provider is working perfectly!"
    )
    
    print("Sending test SMS to +14433073434...")
    try:
        result = await provider.send_sms(message)
        if result:
            print("✅ SMS sent successfully! Check your phone!")
        else:
            print("❌ SMS failed to send")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_sms())

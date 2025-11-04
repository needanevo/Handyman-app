import asyncio
import os
import sys

# Add backend to path
sys.path.insert(0, '/srv/handyman-app/Handyman-app-main')

# Load environment
from dotenv import load_dotenv
load_dotenv('backend/providers/providers.env')

# Import providers
from backend.providers import EMAIL_PROVIDERS
from backend.providers.base import EmailMessage

async def test_email():
    print(f"Available email providers: {list(EMAIL_PROVIDERS.keys())}")
    
    active = os.getenv('ACTIVE_EMAIL_PROVIDER', 'mock')
    print(f"Active provider: {active}")
    
    if 'sendgrid' not in EMAIL_PROVIDERS:
        print("❌ SendGrid not available!")
        return
    
    # Get SendGrid provider
    provider_class = EMAIL_PROVIDERS['sendgrid']
    provider = provider_class()
    
    # Create test email
    message = EmailMessage(
        to=["cipherbmw@gmail.com"],  # Your email from the screenshot
        subject="🎉 Test Email from The Real Johnson!",
        html_content="<h1>Success!</h1><p>Your SendGrid email provider is working!</p>",
        text_content="Success! Your SendGrid email provider is working!"
    )
    
    print("Sending test email...")
    try:
        result = await provider.send_email(message)
        if result:
            print("✅ Email sent successfully!")
        else:
            print("❌ Email failed to send")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_email())

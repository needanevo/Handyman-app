#!/usr/bin/env python3
"""
Simple notification script using SendGrid
Usage: python send_notification.py "Subject" "Message body"
"""

import sys
import os
import asyncio
from pathlib import Path

# Add backend to path
backend_path = Path(__file__).parent.parent / "backend"
sys.path.insert(0, str(backend_path))

# Load environment variables from providers.env
from dotenv import load_dotenv
providers_env = backend_path / "providers" / "providers.env"
load_dotenv(providers_env)

# Clean up environment variables (strip whitespace)
for key in ['SENDGRID_API_KEY', 'SENDGRID_FROM_EMAIL', 'ADMIN_EMAIL']:
    if key in os.environ:
        os.environ[key] = os.environ[key].strip()

from providers.sendgrid_email_provider import SendGridEmailProvider
from providers.base import EmailMessage

async def send_notification(subject: str, message: str, to_email: str = None):
    """Send email notification using SendGrid"""
    try:
        if to_email is None:
            to_email = os.getenv("ADMIN_EMAIL", "needanevo@me.com")

        provider = SendGridEmailProvider()

        email_msg = EmailMessage(
            to=[to_email],
            subject=subject,
            text_content=message,
            html_content=f"<html><body><pre>{message}</pre></body></html>"
        )

        success = await provider.send_email(email_msg)

        if success:
            print(f"Notification sent successfully to {to_email}")
            return 0
        else:
            print(f"Failed to send notification to {to_email}")
            return 1

    except Exception as e:
        print(f"Error sending notification: {str(e)}")
        return 1

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: send_notification.py 'Subject' 'Message body' [email]")
        sys.exit(1)

    subject = sys.argv[1]
    message = sys.argv[2]
    to_email = sys.argv[3] if len(sys.argv) > 3 else None

    exit_code = asyncio.run(send_notification(subject, message, to_email))
    sys.exit(exit_code)

import os
from typing import Dict, Any, List
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Email, To, Content
from .base import EmailProvider, EmailMessage, ProviderError

class SendGridEmailProvider(EmailProvider):
    def __init__(self):
        api_key = os.getenv("SENDGRID_API_KEY")
        if not api_key:
            raise ProviderError("SENDGRID_API_KEY missing")
        self.client = SendGridAPIClient(api_key)
        self.default_from = os.getenv("SENDGRID_FROM_EMAIL", "noreply@therealjohnson.com")
        
    async def send_email(self, message: EmailMessage) -> bool:
        try:
            from_email = Email(message.from_email or self.default_from)
            to_emails = [To(email) for email in message.to]
            content = Content("text/html", message.html_content)
            mail = Mail(from_email=from_email, to_emails=to_emails, subject=message.subject, html_content=message.html_content)
            if message.text_content:
                mail.add_content(Content("text/plain", message.text_content))
            response = self.client.send(mail)
            return response.status_code in [200, 201, 202]
        except Exception as e:
            raise ProviderError(f"SendGrid email failed: {str(e)}")
    
    async def send_template_email(self, template_id: str, to: List[str], data: Dict[str, Any]) -> bool:
        try:
            from_email = Email(self.default_from)
            to_emails = [To(email) for email in to]
            mail = Mail(from_email=from_email, to_emails=to_emails)
            mail.template_id = template_id
            mail.dynamic_template_data = data
            response = self.client.send(mail)
            return response.status_code in [200, 201, 202]
        except Exception as e:
            raise ProviderError(f"SendGrid template email failed: {str(e)}")
#TWILIO_EOF
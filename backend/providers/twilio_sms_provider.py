import os
from twilio.rest import Client
from .base import SmsProvider, SmsMessage, ProviderError

class TwilioSmsProvider(SmsProvider):
    def __init__(self):
        account_sid = os.getenv("TWILIO_ACCOUNT_SID")
        auth_token = os.getenv("TWILIO_AUTH_TOKEN")
        
        if not account_sid or not auth_token:
            raise ProviderError("TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN required")
        
        self.client = Client(account_sid, auth_token)
        
        # Support both phone number and messaging service
        self.default_from = os.getenv("TWILIO_FROM_NUMBER")
        self.messaging_service_sid = os.getenv("TWILIO_MESSAGING_SERVICE_SID")
        
        if not self.default_from and not self.messaging_service_sid:
            raise ProviderError("Either TWILIO_FROM_NUMBER or TWILIO_MESSAGING_SERVICE_SID required")
    
    async def send_sms(self, message: SmsMessage) -> bool:
        try:
            # Prepare message parameters
            msg_params = {
                'body': message.message,
                'to': message.to
            }
            
            # Use messaging service if available, otherwise use from number
            if self.messaging_service_sid:
                msg_params['messaging_service_sid'] = self.messaging_service_sid
            else:
                from_number = message.from_number or self.default_from
                msg_params['from_'] = from_number
            
            twilio_message = self.client.messages.create(**msg_params)
            
            return twilio_message.status in ['queued', 'sent', 'delivered']
            
        except Exception as e:
            raise ProviderError(f"Twilio SMS failed: {str(e)}")

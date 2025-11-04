from .email_base import EmailProvider


class MockEmailProvider(EmailProvider):
    def send_email(self, to, subject, body):
        print(f"[MockEmail] {to} :: {subject}")
        return {"status": "sent"}

from typing import Dict, Type
import os
from .base import (
    AiProvider,
    EmailProvider,
    SmsProvider,
    PaymentProvider,
    MapsProvider,
    MaterialsPricingProvider,
    AccountingProvider
)
from .mock_providers import (
    MockEmailProvider,
    MockSmsProvider,
    MockPaymentProvider,
    MockMapsProvider,
    MockAiProvider,
    MockMaterialsPricingProvider,
    MockAccountingProvider
)
from .ai_provider import OpenAiProvider
from .google_maps_provider import GoogleMapsProvider

try:
    from .sendgrid_email_provider import SendGridEmailProvider
    SENDGRID_AVAILABLE = True
except ImportError:
    SENDGRID_AVAILABLE = False

try:
    from .twilio_sms_provider import TwilioSmsProvider
    TWILIO_AVAILABLE = True
except ImportError:
    TWILIO_AVAILABLE = False

try:
    from .stripe_payment_provider import StripePaymentProvider
    STRIPE_AVAILABLE = True
except ImportError:
    STRIPE_AVAILABLE = False

try:
    from .lowes_api_provider import LowesApiProvider
    LOWES_AVAILABLE = True
except ImportError:
    LOWES_AVAILABLE = False

try:
    from .homedepot_api_provider import HomeDepotApiProvider
    HOMEDEPOT_AVAILABLE = True
except ImportError:
    HOMEDEPOT_AVAILABLE = False

try:
    from .intuit_quickbooks_provider import IntuitQuickBooksProvider
    QUICKBOOKS_AVAILABLE = True
except ImportError:
    QUICKBOOKS_AVAILABLE = False

# Provider registries
AI_PROVIDERS: Dict[str, Type[AiProvider]] = {"mock": MockAiProvider, "openai": OpenAiProvider}

EMAIL_PROVIDERS: Dict[str, Type[EmailProvider]] = {"mock": MockEmailProvider}
if SENDGRID_AVAILABLE:
    EMAIL_PROVIDERS["sendgrid"] = SendGridEmailProvider

SMS_PROVIDERS: Dict[str, Type[SmsProvider]] = {"mock": MockSmsProvider}
if TWILIO_AVAILABLE:
    SMS_PROVIDERS["twilio"] = TwilioSmsProvider

PAYMENT_PROVIDERS: Dict[str, Type[PaymentProvider]] = {"mock": MockPaymentProvider}
if STRIPE_AVAILABLE:
    PAYMENT_PROVIDERS["stripe"] = StripePaymentProvider

MAPS_PROVIDERS: Dict[str, Type[MapsProvider]] = {"mock": MockMapsProvider, "google": GoogleMapsProvider}

MATERIALS_PROVIDERS: Dict[str, Type[MaterialsPricingProvider]] = {"mock": MockMaterialsPricingProvider}
if LOWES_AVAILABLE:
    MATERIALS_PROVIDERS["lowes"] = LowesApiProvider
if HOMEDEPOT_AVAILABLE:
    MATERIALS_PROVIDERS["homedepot"] = HomeDepotApiProvider

ACCOUNTING_PROVIDERS: Dict[str, Type[AccountingProvider]] = {"mock": MockAccountingProvider}
if QUICKBOOKS_AVAILABLE:
    ACCOUNTING_PROVIDERS["quickbooks"] = IntuitQuickBooksProvider


def get_active_providers():
    active_ai = os.getenv("ACTIVE_AI_PROVIDER", "mock")
    active_email = os.getenv("ACTIVE_EMAIL_PROVIDER", "mock")
    active_sms = os.getenv("ACTIVE_SMS_PROVIDER", "mock")
    active_payment = os.getenv("ACTIVE_PAYMENT_PROVIDER", "mock")
    active_maps = os.getenv("ACTIVE_MAPS_PROVIDER", "mock")
    active_materials = os.getenv("ACTIVE_MATERIALS_PROVIDER", "mock")
    active_accounting = os.getenv("ACTIVE_ACCOUNTING_PROVIDER", "mock")

    return {
        "ai": AI_PROVIDERS.get(active_ai, MockAiProvider)(),
        "email": EMAIL_PROVIDERS.get(active_email, MockEmailProvider)(),
        "sms": SMS_PROVIDERS.get(active_sms, MockSmsProvider)(),
        "payment": PAYMENT_PROVIDERS.get(active_payment, MockPaymentProvider)(),
        "maps": MAPS_PROVIDERS.get(active_maps, MockMapsProvider)(),
        "materials": MATERIALS_PROVIDERS.get(active_materials, MockMaterialsPricingProvider)(),
        "accounting": ACCOUNTING_PROVIDERS.get(active_accounting, MockAccountingProvider)()
    }


__all__ = [
    "AI_PROVIDERS",
    "EMAIL_PROVIDERS",
    "SMS_PROVIDERS",
    "PAYMENT_PROVIDERS",
    "MAPS_PROVIDERS",
    "MATERIALS_PROVIDERS",
    "ACCOUNTING_PROVIDERS",
    "get_active_providers"
]

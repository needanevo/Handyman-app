from typing import Dict, Type
from .base import AiProvider

from .mock_email_provider import MockEmailProvider
from .google_maps_provider import GoogleMapsProvider
from .ai_provider import OpenAiProvider
AI_PROVIDERS = {"openai": OpenAiProvider}


EMAIL_PROVIDERS = {"mock": MockEmailProvider}
MAPS_PROVIDERS = {"google": GoogleMapsProvider}
__all__ = ["AI_PROVIDERS", "EMAIL_PROVIDERS", "MAPS_PROVIDERS"]

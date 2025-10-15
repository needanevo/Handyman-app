# from .base import AiProvider, AiQuoteSuggestion, ProviderError
##
# __all__ = ["AiProvider", "AiQuoteSuggestion", "ProviderError"]
##from backend.providers.demo_provider import DemoProvider

##PROVIDERS = {"demo": DemoProvider}
##DEFAULT_PROVIDER = "demo"
##from .mock_email_provider import MockEmailProvider
from .demo_provider import DemoProvider

##EMAIL_PROVIDERS={"mock":MockEmailProvider}; AI_PROVIDERS={"demo":DemoProvider}
##__all__=["EMAIL_PROVIDERS","AI_PROVIDERS","MockEmailProvider","DemoProvider"]
# backend/providers/__init__.py
from typing import Dict, Type
from .base import AiProvider
from .demo_provider import DemoProvider
from .mock_email_provider import MockEmailProvider

AI_PROVIDERS: Dict[str, Type[AiProvider]] = {"demo": DemoProvider}
try:
    from .openai_provider import OpenAiProvider

    AI_PROVIDERS["openai"] = OpenAiProvider
except Exception:
    pass

EMAIL_PROVIDERS: Dict[str, Type[object]] = {"mock": MockEmailProvider}
__all__ = ["AI_PROVIDERS", "EMAIL_PROVIDERS"]

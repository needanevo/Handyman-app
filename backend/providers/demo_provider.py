from .base import AiProvider, AiQuoteSuggestion

class DemoProvider(AiProvider):
    async def generate_quote_suggestion(self, text: str) -> AiQuoteSuggestion:
        return AiQuoteSuggestion(provider="demo", text=f"Demo: {text[:40]}...", confidence=0.9)

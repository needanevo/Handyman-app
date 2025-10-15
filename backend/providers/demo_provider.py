from backend.providers.base import AiProvider, AiQuoteSuggestion


class DemoProvider(AiProvider):
    def get_quote_suggestion(self, text: str) -> AiQuoteSuggestion:
        # Simple mock quote to prove frontend loop works
        suggestion = f"Demo quote for: {text[:40]}..."
        return AiQuoteSuggestion(provider="demo", text=suggestion, confidence=0.9)

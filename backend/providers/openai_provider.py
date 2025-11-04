import asyncio
import json
import os
from typing import List
from dotenv import load_dotenv
from openai import OpenAI
from .base import AiProvider, AiQuoteSuggestion, ProviderError

# Load environment variables from providers.env
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "providers.env"))


class OpenAiProvider(AiProvider):
    """
    OpenAI-based implementation of the AI Provider for quote suggestions.
    Replaces Emergent AI provider but preserves identical structure and output behavior.
    """

    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        self.model = os.getenv("AI_QUOTE_MODEL", "gpt-4o-mini")
        self.safety_mode = os.getenv("AI_SAFETY_MODE", "true").lower() == "true"

        if not self.api_key:
            raise ProviderError("OPENAI_API_KEY not found in providers.env")

        self.client = OpenAI(api_key=self.api_key)

    async def generate_quote_suggestion(
        self,
        service_type: str,
        description: str,
        photos_metadata: List[str] = None,
    ) -> AiQuoteSuggestion:
        """Generate AI-powered quote suggestion using OpenAI."""

        try:
            # Build the prompt
            prompt = f"""
            Analyze this handyman job request and provide a structured estimate including parts, materials, and labor (base hourly rate $150/hr):

                Service Type: {service_type}
                Customer Description: {description}
                Photos Provided: {len(photos_metadata or [])} images

                Provide your response in this exact JSON format:
                {{
                    "estimated_hours": <number>,
                    "suggested_materials": ["material1", "material2", "material3"],
                    "complexity_rating": <1-5>,
                    "base_price_suggestion": <number>,
                    "reasoning": "<detailed explanation>",
                    "confidence": <0.0-1.0>
                }}
            """

            # Run OpenAI request asynchronously via thread offload
            response = await asyncio.to_thread(
                lambda: self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {
                            "role": "system",
                            "content": """
                            You are a professional handyman estimation assistant for The Real Johnson Handyman Services.
                            You help estimate job complexity, time requirements, and material needs based on service descriptions.

                            Your job is to provide structured suggestions for quotes, NOT final pricing.
                            The final pricing is calculated by our deterministic pricing engine.

                            Provide realistic estimates based on:
                            1. Service type and complexity
                            2. Description details
                            3. Industry standards for handyman work
                            4. Safety considerations

                            Always be conservative in estimates to ensure customer satisfaction.
                            Your output must strictly follow the JSON format requested by the user.
                            """,
                        },
                        {"role": "user", "content": prompt},
                    ],
                    max_tokens=int(os.getenv("AI_MAX_TOKENS", "700")),
                )
            )

            response_text = response.choices[0].message.content.strip()

            # Remove markdown fences if present
            if response_text.startswith("```json"):
                response_text = (
                    response_text.split("```json")[1].split("```")[0].strip()
                )
            elif response_text.startswith("```"):
                response_text = response_text.split("```")[1].strip()

            data = json.loads(response_text)

            # Map structured response to AiQuoteSuggestion
            suggestion = AiQuoteSuggestion(
                estimated_hours=max(0.5, float(data.get("estimated_hours", 2.0))),
                suggested_materials=data.get("suggested_materials", [])[:5],
                complexity_rating=max(1, min(5, int(data.get("complexity_rating", 3)))),
                base_price_suggestion=max(
                    50, float(data.get("base_price_suggestion", 150))
                ),
                reasoning=str(
                    data.get(
                        "reasoning", "AI analysis based on service type and description"
                    )
                )[:500],
                confidence=max(0.1, min(1.0, float(data.get("confidence", 0.7)))),
            )

            return suggestion

        except Exception as e:
            if self.safety_mode:
                return self._create_fallback_suggestion(
                    service_type, description, error=str(e)
                )
            raise ProviderError(f"AI quote generation failed: {str(e)}")

    def _create_fallback_suggestion(
        self, service_type: str, description: str, error: str = None
    ) -> AiQuoteSuggestion:
        """Create a safe fallback suggestion when AI fails."""

        fallback_configs = {
            "drywall": {
                "hours": 3.0,
                "price": 150,
                "materials": ["Drywall compound", "Sandpaper", "Primer"],
                "complexity": 3,
            },
            "painting": {
                "hours": 4.0,
                "price": 200,
                "materials": ["Paint", "Primer", "Brushes", "Drop cloths"],
                "complexity": 2,
            },
            "electrical": {
                "hours": 2.0,
                "price": 180,
                "materials": ["Electrical components", "Wire nuts", "Electrical tape"],
                "complexity": 4,
            },
            "plumbing": {
                "hours": 2.5,
                "price": 160,
                "materials": ["Pipe fittings", "Plumber's putty", "Teflon tape"],
                "complexity": 4,
            },
            "carpentry": {
                "hours": 4.5,
                "price": 220,
                "materials": ["Wood materials", "Screws", "Wood glue", "Sandpaper"],
                "complexity": 3,
            },
        }

        config = fallback_configs.get(service_type.lower(), fallback_configs["drywall"])

        # Adjust for longer or complex descriptions
        if len(description) > 100:
            config["hours"] *= 1.2
            config["price"] *= 1.2
            config["complexity"] = min(5, config["complexity"] + 1)

        reasoning = f"Fallback estimate for {service_type} service."
        if error:
            reasoning += f" AI processing temporarily unavailable: {error[:100]}"

        return AiQuoteSuggestion(
            estimated_hours=config["hours"],
            suggested_materials=config["materials"],
            complexity_rating=config["complexity"],
            base_price_suggestion=config["price"],
            reasoning=reasoning,
            confidence=0.6,
        )

import asyncio
from typing import List, Dict, Any, Optional
from dotenv import load_dotenv
import os
from emergentintegrations.llm.chat import LlmChat, UserMessage
from .base import AiProvider, AiQuoteSuggestion, ProviderError

load_dotenv()

class EmergentAiProvider(AiProvider):
    def __init__(self):
        self.api_key = os.getenv('EMERGENT_LLM_KEY')
        self.model = os.getenv('AI_QUOTE_MODEL', 'gpt-4o-mini')
        self.safety_mode = os.getenv('AI_SAFETY_MODE', 'true').lower() == 'true'
        
        if not self.api_key:
            raise ProviderError("EMERGENT_LLM_KEY not found in environment")
    
    def _create_chat_session(self, session_id: str = None) -> LlmChat:
        """Create a new chat session for quote generation"""
        system_message = """
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
"""
        
        chat = LlmChat(
            api_key=self.api_key,
            session_id=session_id or "quote_estimation",
            system_message=system_message
        ).with_model("openai", self.model)
        
        return chat
    
    async def generate_quote_suggestion(self, service_type: str, description: str, photos_metadata: List[str] = None) -> AiQuoteSuggestion:
        """Generate AI-powered quote suggestion"""
        try:
            # Create prompt for structured output
            prompt = f"""
Analyze this handyman job request and provide a structured estimate:

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

Considerations:
- Complexity rating: 1=Simple, 2=Easy, 3=Moderate, 4=Challenging, 5=Expert
- Include travel time and setup in hours estimate
- Suggest common materials needed (3-5 items max)
- Base price should be competitive for small handyman business
- Confidence based on description clarity and your expertise
"""
            
            # Create chat session and send message
            chat = self._create_chat_session()
            user_message = UserMessage(text=prompt)
            
            response = await chat.send_message(user_message)
            
            # Parse JSON response
            import json
            try:
                # Extract JSON from response (handle potential markdown formatting)
                response_text = response.strip()
                if response_text.startswith("```json"):
                    response_text = response_text.split("```json")[1].split("```")[0].strip()
                elif response_text.startswith("```"):
                    response_text = response_text.split("```")[1].strip()
                
                data = json.loads(response_text)
                
                # Validate and create suggestion object
                suggestion = AiQuoteSuggestion(
                    estimated_hours=max(0.5, float(data.get('estimated_hours', 2.0))),  # Minimum 30 min
                    suggested_materials=data.get('suggested_materials', [])[:5],  # Limit to 5 items
                    complexity_rating=max(1, min(5, int(data.get('complexity_rating', 3)))),  # 1-5 range
                    base_price_suggestion=max(50, float(data.get('base_price_suggestion', 150))),  # Minimum $50
                    reasoning=str(data.get('reasoning', 'AI analysis based on service type and description'))[:500],  # Limit length
                    confidence=max(0.1, min(1.0, float(data.get('confidence', 0.7))))  # 0.1-1.0 range
                )
                
                return suggestion
                
            except (json.JSONDecodeError, KeyError, ValueError) as e:
                # Fallback if JSON parsing fails
                return self._create_fallback_suggestion(service_type, description)
                
        except Exception as e:
            if self.safety_mode:
                # Return safe fallback in safety mode
                return self._create_fallback_suggestion(service_type, description, error=str(e))
            else:
                raise ProviderError(f"AI quote generation failed: {str(e)}")
    
    def _create_fallback_suggestion(self, service_type: str, description: str, error: str = None) -> AiQuoteSuggestion:
        """Create a safe fallback suggestion when AI fails"""
        
        # Basic fallback based on service type
        fallback_configs = {
            "drywall": {"hours": 3.0, "price": 150, "materials": ["Drywall compound", "Sandpaper", "Primer"], "complexity": 3},
            "painting": {"hours": 4.0, "price": 200, "materials": ["Paint", "Primer", "Brushes", "Drop cloths"], "complexity": 2},
            "electrical": {"hours": 2.0, "price": 180, "materials": ["Electrical components", "Wire nuts", "Electrical tape"], "complexity": 4},
            "plumbing": {"hours": 2.5, "price": 160, "materials": ["Pipe fittings", "Plumber's putty", "Teflon tape"], "complexity": 4},
            "carpentry": {"hours": 4.5, "price": 220, "materials": ["Wood materials", "Screws", "Wood glue", "Sandpaper"], "complexity": 3}
        }
        
        config = fallback_configs.get(service_type.lower(), fallback_configs["drywall"])
        
        # Adjust for description complexity
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
            confidence=0.6  # Lower confidence for fallback
        )
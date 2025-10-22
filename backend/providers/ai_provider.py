import json, os
from typing import List, Optional
from openai import OpenAI # type: ignore
from .base import AiProvider, AiQuoteSuggestion, ProviderError
class OpenAiProvider(AiProvider):


    def __init__(self):
        key = os.getenv("OPENAI_API_KEY")
        if not key: raise ProviderError("OPENAI_API_KEY missing")
        self.client = OpenAI(api_key=key)
        self.model = os.getenv("AI_QUOTE_MODEL","gpt-4o-mini")
        self.safety_mode = os.getenv("AI_SAFETY_MODE","true").lower()=="true"

    def generate_quote_suggestion(self, service_type:str, description:str, photos_metadata:Optional[List[str]]=None)->AiQuoteSuggestion:
        try:
            prompt = f"Service:{service_type}\nDesc:{description}\nPhotos:{len(photos_metadata or [])}\nReturn JSON with estimated_hours,suggested_materials,complexity_rating,base_price_suggestion,reasoning,confidence."
            r = self.client.chat.completions.create(model=self.model, messages=[{"role":"system","content":"You are a handyman estimation assistant."},{"role":"user","content":prompt}], max_tokens=int(os.getenv("AI_MAX_TOKENS","700")), temperature=0.2)
            txt = r.choices[0].message.content.strip()
            if txt.startswith("```"): txt = txt.split("```")[1].replace("json","").strip()
            d = json.loads(txt)
            return AiQuoteSuggestion(estimated_hours=max(0.5,float(d.get("estimated_hours",2.0))), suggested_materials=d.get("suggested_materials",[])[:5], complexity_rating=max(1,min(5,int(d.get("complexity_rating",3)))), base_price_suggestion=max(50,float(d.get("base_price_suggestion",150))), reasoning=str(d.get("reasoning","AI analysis"))[:500], confidence=max(0.1,min(1.0,float(d.get("confidence",0.7)))))
        except Exception as e:
            if self.safety_mode: return self._create_fallback_suggestion(service_type, description, str(e)) # pyright: ignore[reportAttributeAccessIssue]
            raise ProviderError(f"AI quote generation failed: {e}")

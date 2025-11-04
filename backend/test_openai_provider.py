import sys, os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


import asyncio
from providers.openai_provider import OpenAiProvider


async def main():
    ai = OpenAiProvider()
    result = await ai.generate_quote_suggestion(
        "painting",
        "Interior walls for 3 rooms, about 1000 sq ft total. Some drywall repairs needed.",
    )
    print("\n=== AI Quote Suggestion ===")
    print(result)
    print("===========================")


if __name__ == "__main__":
    asyncio.run(main())

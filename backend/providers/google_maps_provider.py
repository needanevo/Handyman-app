import os, asyncio, googlemaps

class GoogleMapsProvider:
    def __init__(self):
        self.gm = googlemaps.Client(key=os.getenv("GOOGLE_MAPS_API_KEY"))

    async def geocode(self, address_string: str):
        loop = asyncio.get_event_loop()
        r = await loop.run_in_executor(None, self.gm.geocode, address_string)  # ← Use address_string directly
        if not r:
            return None
        loc = r[0]["geometry"]["location"]
        return {"latitude": loc["lat"], "longitude": loc["lng"]}
import os, asyncio, googlemaps


class GoogleMapsProvider:
    def __init__(self):
        self.gm = googlemaps.Client(key=os.getenv("GOOGLE_MAPS_API_KEY"))

    async def geocode(self, a: dict):
        q = f"{a['street']}, {a['city']}, {a['state']} {a['zip_code']}"
        loop = asyncio.get_event_loop()
        r = await loop.run_in_executor(None, self.gm.geocode, q)
        if not r:
            return None
        loc = r[0]["geometry"]["location"]
        return {"latitude": loc["lat"], "longitude": loc["lng"]}

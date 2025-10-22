import os
from dotenv import load_dotenv
import googlemaps

# Load environment variables
load_dotenv('backend/providers/providers.env')

api_key = os.getenv('GOOGLE_MAPS_API_KEY')
print(f"API Key loaded: {api_key[:10]}..." if api_key else "No API key found!")

if api_key:
    gmaps = googlemaps.Client(key=api_key)
    try:
        result = gmaps.geocode('1600 Amphitheatre Parkway, Mountain View, CA')
        if result:
            loc = result[0]['geometry']['location']
            print(f"Success! Lat: {loc['lat']}, Lng: {loc['lng']}")
        else:
            print("No results returned")
    except Exception as e:
        print(f"Error: {e}")

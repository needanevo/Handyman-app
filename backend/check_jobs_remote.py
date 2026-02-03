#!/usr/bin/env python3
"""Check jobs in MongoDB Atlas"""
from pymongo import MongoClient

# Use correct MongoDB Atlas connection
MONGO_URL = "mongodb+srv://needanevo:$1Jennifer@cluster0.d5iqsxn.mongodb.net/?appName=Cluster0&w=majority&tlsAllowInvalidCertificates=true"

client = MongoClient(MONGO_URL)
db = client['handyman']

print('=== Jobs Collection ===')
print('Total jobs:', db.jobs.count_documents({}))
print('Status distribution:')
for doc in db.jobs.aggregate([{'$group': {'_id': '$status', 'count': {'$sum': 1}}}]):
    print(f"  {doc['_id']}: {doc['count']}")

# Show sample job
print('\nSample job:')
job = db.jobs.find_one()
if job:
    print(f"  ID: {job.get('_id')}")
    print(f"  Status: {job.get('status')}")
    print(f"  Title: {job.get('title')}")
    print(f"  Address: {job.get('address')}")
else:
    print("  No jobs found")

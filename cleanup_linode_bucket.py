#!/usr/bin/env python3
"""
Cleanup script for Linode Object Storage bucket
Deletes all files in the 'photos' bucket
"""
import boto3
from botocore.config import Config

# Linode credentials (from providers.env)
ACCESS_KEY = "KI6TNAOLFKWODXWX3M1I"
SECRET_KEY = "wMjt5HcYuYrTrs3AzIQhubcnYGfoCiiw2BTPEdoL"
BUCKET_NAME = "photos"
ENDPOINT_URL = "https://us-iad-10.linodeobjects.com"
REGION = "us-iad-10"

def list_objects():
    """List all objects in the bucket"""
    s3_client = boto3.client(
        's3',
        aws_access_key_id=ACCESS_KEY,
        aws_secret_access_key=SECRET_KEY,
        endpoint_url=ENDPOINT_URL,
        region_name=REGION,
        config=Config(signature_version='s3v4')
    )

    response = s3_client.list_objects_v2(Bucket=BUCKET_NAME, MaxKeys=1000)

    if 'Contents' in response:
        return response['Contents']
    return []

def delete_all_objects():
    """Delete all objects from the bucket"""
    s3_client = boto3.client(
        's3',
        aws_access_key_id=ACCESS_KEY,
        aws_secret_access_key=SECRET_KEY,
        endpoint_url=ENDPOINT_URL,
        region_name=REGION,
        config=Config(signature_version='s3v4')
    )

    objects = list_objects()

    if not objects:
        print("Bucket is already empty!")
        return

    print(f"Found {len(objects)} objects to delete")
    total_size = sum(obj['Size'] for obj in objects) / 1024 / 1024
    print(f"Total size: {total_size:.2f} MB")

    confirm = input("\nAre you sure you want to delete all objects? (yes/no): ")
    if confirm.lower() != 'yes':
        print("Cancelled")
        return

    for obj in objects:
        print(f"Deleting: {obj['Key']}")
        s3_client.delete_object(Bucket=BUCKET_NAME, Key=obj['Key'])

    print(f"\nSuccessfully deleted {len(objects)} objects!")

def main():
    print("=== Linode Object Storage Bucket Cleanup ===\n")

    try:
        delete_all_objects()
    except Exception as e:
        print(f"ERROR: {e}")

if __name__ == "__main__":
    main()

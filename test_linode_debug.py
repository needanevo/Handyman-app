#!/usr/bin/env python3
"""
Debug script to test Linode Object Storage connectivity
Run this on the server to diagnose photo upload issues
"""
import os
import sys
import boto3
from botocore.exceptions import ClientError
from botocore.config import Config
from dotenv import load_dotenv

# Load environment
load_dotenv("backend/providers/providers.env")

def test_linode_connection():
    """Test Linode Object Storage connection step by step"""

    print("=" * 60)
    print("LINODE OBJECT STORAGE DEBUG TEST")
    print("=" * 60)

    # Step 1: Check environment variables
    print("\n[1] Checking environment variables...")
    access_key = os.getenv("LINODE_ACCESS_KEY")
    secret_key = os.getenv("LINODE_SECRET_KEY")
    bucket_name = os.getenv("LINODE_BUCKET_NAME", "photos")

    print(f"   LINODE_ACCESS_KEY: {'✓ Set' if access_key else '✗ MISSING'}")
    print(f"   LINODE_SECRET_KEY: {'✓ Set' if secret_key else '✗ MISSING'}")
    print(f"   LINODE_BUCKET_NAME: {bucket_name}")

    if not access_key or not secret_key:
        print("\n❌ FAILED: Missing credentials in providers.env")
        return False

    # Step 2: Create S3 client
    print("\n[2] Creating S3 client...")
    endpoint_url = "https://us-iad-10.linodeobjects.com"
    region = "us-east-1"

    try:
        s3_client = boto3.client(
            's3',
            aws_access_key_id=access_key,
            aws_secret_access_key=secret_key,
            endpoint_url=endpoint_url,
            region_name=region,
            config=Config(
                signature_version='s3v4',
                s3={'addressing_style': 'path'},
                connect_timeout=10,
                read_timeout=10
            )
        )
        print(f"   ✓ S3 client created")
        print(f"   Endpoint: {endpoint_url}")
        print(f"   Region: {region}")
    except Exception as e:
        print(f"   ❌ Failed to create client: {e}")
        return False

    # Step 3: Test bucket access
    print(f"\n[3] Testing bucket access: {bucket_name}...")
    try:
        s3_client.head_bucket(Bucket=bucket_name)
        print(f"   ✓ Bucket '{bucket_name}' is accessible")
    except ClientError as e:
        error_code = e.response['Error']['Code']
        if error_code == '404':
            print(f"   ⚠ Bucket '{bucket_name}' does not exist")
            print(f"   Attempting to create bucket...")
            try:
                s3_client.create_bucket(Bucket=bucket_name)
                print(f"   ✓ Bucket created successfully")
            except ClientError as create_error:
                print(f"   ❌ Failed to create bucket: {create_error}")
                return False
        elif error_code == '403':
            print(f"   ❌ Access Denied (403) - Check credentials and bucket permissions")
            print(f"   Error: {e}")
            return False
        else:
            print(f"   ❌ Error accessing bucket: {e}")
            return False

    # Step 4: Test bucket listing
    print(f"\n[4] Listing objects in bucket...")
    try:
        response = s3_client.list_objects_v2(Bucket=bucket_name, MaxKeys=5)
        object_count = response.get('KeyCount', 0)
        print(f"   ✓ Successfully listed objects")
        print(f"   Objects in bucket: {object_count}")
        if object_count > 0:
            print(f"   Sample objects:")
            for obj in response.get('Contents', [])[:5]:
                print(f"     - {obj['Key']}")
    except ClientError as e:
        print(f"   ❌ Failed to list objects: {e}")
        return False

    # Step 5: Test upload
    print(f"\n[5] Testing file upload...")
    test_key = "test-uploads/debug-test.txt"
    test_content = f"Test upload at {os.popen('date').read().strip()}"

    try:
        s3_client.put_object(
            Bucket=bucket_name,
            Key=test_key,
            Body=test_content.encode('utf-8'),
            ContentType='text/plain'
        )
        print(f"   ✓ Test file uploaded: {test_key}")
    except ClientError as e:
        print(f"   ❌ Upload failed: {e}")
        return False

    # Step 6: Test download
    print(f"\n[6] Testing file download...")
    try:
        response = s3_client.get_object(Bucket=bucket_name, Key=test_key)
        content = response['Body'].read().decode('utf-8')
        print(f"   ✓ Test file downloaded successfully")
        print(f"   Content: {content}")
    except ClientError as e:
        print(f"   ❌ Download failed: {e}")
        return False

    # Step 7: Test public URL generation
    print(f"\n[7] Generating public URL...")
    public_url = f"https://{bucket_name}.{endpoint_url.replace('https://', '')}/{test_key}"
    print(f"   URL: {public_url}")
    print(f"   ⚠ Note: Bucket must have public read ACL for this to work")

    # Step 8: Clean up test file
    print(f"\n[8] Cleaning up test file...")
    try:
        s3_client.delete_object(Bucket=bucket_name, Key=test_key)
        print(f"   ✓ Test file deleted")
    except ClientError as e:
        print(f"   ⚠ Failed to delete test file: {e}")

    print("\n" + "=" * 60)
    print("✅ ALL TESTS PASSED - Linode Object Storage is working!")
    print("=" * 60)
    return True

if __name__ == "__main__":
    success = test_linode_connection()
    sys.exit(0 if success else 1)

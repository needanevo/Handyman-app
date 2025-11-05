
import os
import boto3
from botocore.exceptions import ClientError
from dotenv import load_dotenv

# Load environment variables from providers.env
load_dotenv("backend/providers/providers.env")

# Linode Object Storage credentials
access_key = os.getenv("LINODE_ACCESS_KEY")
secret_key = os.getenv("LINODE_SECRET_KEY")
region = "us-east-1"  # Correct region for Washington D.C.
endpoint_url = "https://us-iad-10.linodeobjects.com"
bucket_name = os.getenv("LINODE_BUCKET_NAME")

print("--- Configuration ---")
print(f"Region: {region}")
print(f"Endpoint URL: {endpoint_url}")
print(f"Bucket Name: {bucket_name}")
print(f"Access Key ID: {access_key[:4]}...{access_key[-4:] if access_key else 'Not Found'}")
print("--------------------")

if not all([access_key, secret_key, bucket_name]):
    print("\nERROR: Missing one or more environment variables (LINODE_ACCESS_KEY, LINODE_SECRET_KEY, LINODE_BUCKET_NAME).")
    exit()

# Initialize S3 client
s3_client = boto3.client(
    's3',
    aws_access_key_id=access_key,
    aws_secret_access_key=secret_key,
    endpoint_url=endpoint_url,
    region_name=region,
)

try:
    print("\nAttempting to connect and list buckets...")
    response = s3_client.list_buckets()
    
    print("✅ Connection Successful!")
    
    buckets = [bucket['Name'] for bucket in response['Buckets']]
    print("\nAvailable buckets:")
    for b in buckets:
        print(f"- {b}")
        
    if bucket_name in buckets:
        print(f"\n✅ Bucket '{bucket_name}' found.")
    else:
        print(f"\n❌ ERROR: Bucket '{bucket_name}' not found in your account.")

except ClientError as e:
    error_code = e.response.get("Error", {}).get("Code")
    print(f"\n❌ Connection FAILED: {error_code}")
    print(f"   Message: {e}")
    if error_code == "InvalidAccessKeyId":
        print("   Suggestion: The LINODE_ACCESS_KEY is incorrect.")
    elif error_code == "SignatureDoesNotMatch":
        print("   Suggestion: The LINODE_SECRET_KEY is incorrect or the region/endpoint is wrong for your key.")
    elif "EndpointConnectionError" in str(e):
        print("   Suggestion: Could not connect to the endpoint. This might be a firewall, DNS, or network issue.")

except Exception as e:
    print(f"\n❌ An unexpected error occurred: {e}")

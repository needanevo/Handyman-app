import os
import boto3
from botocore.exceptions import ClientError
from botocore.config import Config
import requests


from typing import Optional, List
import base64
import uuid
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

class LinodeObjectStorage:
    """
    Linode Object Storage provider using S3-compatible API
    """
    
    def __init__(self):
        # Linode Object Storage credentials
        self.access_key = os.getenv("LINODE_ACCESS_KEY")
        self.secret_key = os.getenv("LINODE_SECRET_KEY")
        self.bucket_name = os.getenv("LINODE_BUCKET_NAME", "photos")
        self.region = "us-east-1" # Linode's Washington, D.C. region
        
        # Linode endpoint format: https://{cluster_id}.linodeobjects.com
        # We will use the specific cluster endpoint for stability
        self.endpoint_url = "https://us-iad-10.linodeobjects.com"
        
        # Initialize S3 client with Linode endpoint and proper timeouts
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=self.access_key,
            aws_secret_access_key=self.secret_key,
            endpoint_url=self.endpoint_url,
            region_name=self.region,
            config=Config(
                signature_version='s3v4',
                s3={'addressing_style': 'virtual'},
                retries={'max_attempts': 3, 'mode': 'adaptive'},
                connect_timeout=60,  # Increased from 3 to 60 seconds
                read_timeout=60      # Increased from 9 to 60 seconds
            )
        )
        logger.info(f"🔧 Linode bucket={self.bucket_name} region={self.region} endpoint={self.endpoint_url}")
        self.s3_client.head_bucket(Bucket=self.bucket_name)
        logger.info("✅ HEAD bucket ok")

        # Ensure bucket exists
        self._ensure_bucket_exists()
    
    def _ensure_bucket_exists(self):
        """Create bucket if it doesn't exist"""
        try:
            self.s3_client.head_bucket(Bucket=self.bucket_name)
            logger.info(f"Bucket {self.bucket_name} exists")
        except ClientError as e:
            error_code = e.response['Error']['Code']
            if error_code == '404':
                # Bucket doesn't exist, create it
                try:
                    self.s3_client.create_bucket(Bucket=self.bucket_name)
                    logger.info(f"Created bucket: {self.bucket_name}")
                except ClientError as create_error:
                    logger.error(f"Failed to create bucket: {create_error}")
                    raise
            else:
                logger.error(f"Error checking bucket: {e}")
                raise

    def _upload_via_presigned_url(
        self,
        object_key: str,
        file_data: bytes,
        content_type: str = 'image/jpeg'
    ) -> str:
        """
        Upload file using presigned URL + requests (boto3 put_object has bug with Linode)
        Returns public URL of uploaded file
        """
        try:
            # Generate presigned URL for PUT
            presigned_url = self.s3_client.generate_presigned_url(
                'put_object',
                Params={
                    'Bucket': self.bucket_name,
                    'Key': object_key,
                    'ContentType': content_type,
                    'ACL': 'public-read'
                },
                ExpiresIn=300  # 5 minutes
            )

            # Upload using requests library (bypasses boto3 response reading bug)
            # Must include ACL header to match presigned URL signature
            response = requests.put(
                presigned_url,
                data=file_data,
                headers={
                    'Content-Type': content_type,
                    'x-amz-acl': 'public-read'
                }
            )

            if response.status_code not in [200, 204]:
                raise Exception(f"Upload failed with status {response.status_code}: {response.text[:200]}")

            # Generate public URL
            public_url = f"https://{self.bucket_name}.us-iad-10.linodeobjects.com/{object_key}"
            logger.info(f"✅ Uploaded via presigned URL: {public_url}")
            return public_url

        except Exception as e:
            logger.error(f"Presigned URL upload failed: {e}")
            raise Exception(f"Photo upload failed: {str(e)}")

    async def upload_photo(
        self, 
        photo_data: str, 
        customer_id: str, 
        quote_id: str,
        filename: Optional[str] = None
    ) -> str:
        """
        Upload a base64 encoded photo to Linode Object Storage
        
        Args:
            photo_data: Base64 encoded image string
            customer_id: Customer ID for organizing files
            quote_id: Quote ID for organizing files
            filename: Optional filename, will generate if not provided
            
        Returns:
            Public URL of uploaded photo
        """
        try:
            # Decode base64 image
            # Handle data URL format (e.g., "data:image/png;base64,iVBORw0KG...")
            if ',' in photo_data and photo_data.startswith('data:'):
                photo_data = photo_data.split(',')[1]
            
            image_bytes = base64.b64decode(photo_data)
            
            # Generate filename if not provided
            if not filename:
                timestamp = datetime.utcnow().strftime('%Y%m%d_%H%M%S')
                unique_id = str(uuid.uuid4())[:8]
                filename = f"{timestamp}_{unique_id}.jpg"
            
            # Organize files: customers/{customer_id}/quotes/{quote_id}/{filename}
            object_key = f"customers/{customer_id}/quotes/{quote_id}/{filename}"
            
            # Determine content type from filename or data URL
            content_type = 'image/jpeg'
            if filename.lower().endswith('.png'):
                content_type = 'image/png'
            elif filename.lower().endswith('.gif'):
                content_type = 'image/gif'
            elif filename.lower().endswith('.webp'):
                content_type = 'image/webp'
            
            # Upload to Linode Object Storage
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=object_key,
                Body=image_bytes,
                ContentType=content_type,
                ACL='public-read'  # Make publicly accessible
            )
            logger.info(f"📦 PUT -> bucket={self.bucket_name} key={object_key}")
            self.s3_client.head_object(Bucket=self.bucket_name, Key=object_key)
            logger.info("✅ HEAD object ok")

            # Generate public URL - use the correct Linode endpoint format
            public_url = f"https://{self.bucket_name}.us-iad-10.linodeobjects.com/{object_key}"
            
            logger.info(f"Uploaded photo to: {public_url}")
            return public_url
            
        except Exception as e:
            logger.error(f"Failed to upload photo: {e}")
            raise Exception(f"Photo upload failed: {str(e)}")
    
    async def upload_multiple_photos(
        self,
        photos: List[str],
        customer_id: str,
        quote_id: str
    ) -> List[str]:
        """
        Upload multiple photos and return list of URLs
        
        Args:
            photos: List of base64 encoded images
            customer_id: Customer ID
            quote_id: Quote ID
            
        Returns:
            List of public URLs
        """
        urls = []
        for i, photo in enumerate(photos):
            try:
                url = await self.upload_photo(
                    photo_data=photo,
                    customer_id=customer_id,
                    quote_id=quote_id,
                    filename=f"photo_{i+1}.jpg"
                )
                urls.append(url)
            except Exception as e:
                logger.error(f"Failed to upload photo {i+1}: {e}")
                # Continue with other photos even if one fails
                urls.append(f"[Upload Failed: {str(e)}]")
        
        return urls
    
    async def delete_photo(self, photo_url: str) -> bool:
        """
        Delete a photo from storage
        
        Args:
            photo_url: Full URL of the photo
            
        Returns:
            True if deleted successfully
        """
        try:
            # Extract object key from URL
            object_key = photo_url.replace(f"{self.endpoint_url}/{self.bucket_name}/", "")
            
            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=object_key
            )
            
            logger.info(f"Deleted photo: {object_key}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to delete photo: {e}")
            return False
    
    async def delete_quote_photos(self, customer_id: str, quote_id: str) -> bool:
        """
        Delete all photos for a specific quote
        
        Args:
            customer_id: Customer ID
            quote_id: Quote ID
            
        Returns:
            True if deleted successfully
        """
        try:
            prefix = f"customers/{customer_id}/quotes/{quote_id}/"
            
            # List all objects with this prefix
            response = self.s3_client.list_objects_v2(
                Bucket=self.bucket_name,
                Prefix=prefix
            )
            
            if 'Contents' in response:
                # Delete all objects
                objects_to_delete = [{'Key': obj['Key']} for obj in response['Contents']]
                
                self.s3_client.delete_objects(
                    Bucket=self.bucket_name,
                    Delete={'Objects': objects_to_delete}
                )
                
                logger.info(f"Deleted {len(objects_to_delete)} photos for quote {quote_id}")
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to delete quote photos: {e}")
            return False

    def generate_signed_url(self, key: str, expires: int = 3600) -> str:
        """Generate a presigned URL for secure access to a photo"""
        return self.s3_client.generate_presigned_url(
            "get_object",
            Params={"Bucket": self.bucket_name, "Key": key},
            ExpiresIn=expires,
        )

    async def upload_photo_bytes(self, data: bytes, key: str) -> str:
        """Upload raw bytes directly to storage"""
        self.s3_client.put_object(
            Bucket=self.bucket_name, Key=key, Body=data, ContentType="image/jpeg"
        )
        logger.info(f"📦 PUT -> bucket={self.bucket_name} key={key}")
        self.s3_client.head_object(Bucket=self.bucket_name, Key=key)
        logger.info("✅ HEAD object ok")
        return self.generate_signed_url(key)

    async def upload_photo_direct(
        self,
        file_data: bytes,
        customer_id: str,
        quote_id: str,
        filename: str,
        content_type: str = 'image/jpeg'
    ) -> str:
        """
        Upload photo bytes directly to Linode Object Storage using presigned URLs

        Args:
            file_data: Raw image bytes
            customer_id: Customer ID for organizing files
            quote_id: Quote ID for organizing files
            filename: Filename with extension
            content_type: MIME type of the image

        Returns:
            Public URL of uploaded photo
        """
        # Organize files: customers/{customer_id}/quotes/{quote_id}/{filename}
        object_key = f"customers/{customer_id}/quotes/{quote_id}/{filename}"
        return self._upload_via_presigned_url(object_key, file_data, content_type)

    async def upload_contractor_document(
        self,
        file_data: bytes,
        contractor_id: str,
        document_type: str,  # 'license', 'insurance', 'business_license'
        filename: str,
        content_type: str = 'image/jpeg'
    ) -> str:
        """
        Upload contractor document (license, insurance, certifications) to profile folder using presigned URLs

        Path: contractors/{contractor_id}/profile/{document_type}_{filename}
        """
        object_key = f"contractors/{contractor_id}/profile/{document_type}_{filename}"
        return self._upload_via_presigned_url(object_key, file_data, content_type)

    async def upload_contractor_portfolio(
        self,
        file_data: bytes,
        contractor_id: str,
        filename: str,
        content_type: str = 'image/jpeg'
    ) -> str:
        """
        Upload contractor portfolio photo using presigned URLs

        Path: contractors/{contractor_id}/portfolio/{filename}
        """
        object_key = f"contractors/{contractor_id}/portfolio/{filename}"
        return self._upload_via_presigned_url(object_key, file_data, content_type)

    async def upload_handyman_profile_photo(
        self,
        file_data: bytes,
        handyman_id: str,
        filename: str,
        extension: str,
        content_type: str = 'image/jpeg'
    ) -> str:
        """
        Upload handyman profile photo using presigned URLs

        Path: handymen/{handyman_id}/profile/profile_{uuid}.{ext}
        """
        import uuid
        unique_filename = f"profile_{uuid.uuid4().hex[:8]}.{extension}"
        object_key = f"handymen/{handyman_id}/profile/{unique_filename}"
        return self._upload_via_presigned_url(object_key, file_data, content_type)


    async def upload_handyman_profile_photo(
        self,
        file_data: bytes,
        handyman_id: str,
        filename: str,
        extension: str,
        content_type: str = 'image/jpeg'
    ) -> str:
        """
        Upload handyman profile photo using presigned URLs

        Path: handymen/{handyman_id}/profile/profile_{uuid}.{ext}
        """
        import uuid
        unique_filename = f"profile_{uuid.uuid4().hex[:8]}.{extension}"
        object_key = f"handymen/{handyman_id}/profile/{unique_filename}"
        return self._upload_via_presigned_url(object_key, file_data, content_type)


    async def upload_contractor_profile_photo(
        self,
        file_data: bytes,
        contractor_id: str,
        filename: str,
        content_type: str = 'image/jpeg'
    ) -> str:
        """
        Upload contractor profile photo/logo using presigned URLs

        Path: contractors/{contractor_id}/profile/{filename}
        """
        object_key = f"contractors/{contractor_id}/profile/{filename}"
        return self._upload_via_presigned_url(object_key, file_data, content_type)

    async def upload_contractor_job_photo(
        self,
        file_data: bytes,
        contractor_id: str,
        job_id: str,
        filename: str,
        content_type: str = 'image/jpeg'
    ) -> str:
        """
        Upload contractor job photo (progress, completion, etc.) using presigned URLs

        Path: contractors/{contractor_id}/jobs/{job_id}/{filename}
        """
        object_key = f"contractors/{contractor_id}/jobs/{job_id}/{filename}"
        return self._upload_via_presigned_url(object_key, file_data, content_type)

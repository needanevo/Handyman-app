import os
import boto3
from botocore.exceptions import ClientError
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
        self.bucket_name = os.getenv("LINODE_BUCKET_NAME", "handyman-photos")
        self.region = os.getenv("LINODE_REGION", "us-east-1")  # e.g., us-east-1, eu-central-1
        
        # Linode endpoint format: https://{region}.linodeobjects.com
        self.endpoint_url = f"https://{self.region}.linodeobjects.com"
        
        if not all([self.access_key, self.secret_key]):
            raise ValueError("LINODE_ACCESS_KEY and LINODE_SECRET_KEY must be set")
        
        # Initialize S3 client with Linode endpoint
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=self.access_key,
            aws_secret_access_key=self.secret_key,
            endpoint_url=self.endpoint_url,
            region_name=self.region
        )
        
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
            
            # Generate public URL
            public_url = f"{self.endpoint_url}/{self.bucket_name}/{object_key}"
            
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

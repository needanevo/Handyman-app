#!/usr/bin/env python3
"""
Add handyman storage methods to linode_storage_provider.py
Adds upload_handyman_profile_photo method
"""

def add_handyman_storage_methods():
    with open('providers/linode_storage_provider.py', 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the contractor profile photo method
    contractor_method_marker = '    async def upload_contractor_profile_photo('

    if contractor_method_marker not in content:
        print("[ERROR] Could not find upload_contractor_profile_photo method")
        return False

    # Create handyman method
    handyman_method = '''    async def upload_handyman_profile_photo(
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

'''

    # Insert before contractor profile photo method
    insert_pos = content.index(contractor_method_marker)
    new_content = content[:insert_pos] + handyman_method + '\n' + content[insert_pos:]

    with open('providers/linode_storage_provider.py', 'w', encoding='utf-8') as f:
        f.write(new_content)

    print("[OK] Added upload_handyman_profile_photo method to storage provider")
    return True

if __name__ == "__main__":
    success = add_handyman_storage_methods()
    exit(0 if success else 1)

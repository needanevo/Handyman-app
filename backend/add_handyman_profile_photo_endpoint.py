#!/usr/bin/env python3
"""
Add POST /handyman/profile-photo/upload endpoint
Allows handymen to upload profile photos (same as contractors)
"""

def add_handyman_profile_photo_endpoint():
    with open('server.py', 'r', encoding='utf-8') as f:
        content = f.read()

    # Find the contractor profile photo endpoint
    contractor_endpoint_marker = '@api_router.post("/contractor/profile-photo/upload")'

    if contractor_endpoint_marker not in content:
        print("[ERROR] Could not find contractor profile-photo endpoint")
        return False

    # Create handyman endpoint (similar to contractor but for handyman role)
    handyman_endpoint = '''
@api_router.post("/handyman/profile-photo/upload")
async def upload_handyman_profile_photo(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user_dependency)
):
    """
    Upload handyman profile photo
    Saves to: handymen/{handyman_id}/profile/profile_{uuid}.{ext}
    Updates user.profile_photo field in database
    """
    if current_user.role != UserRole.HANDYMAN:
        raise HTTPException(403, detail="Only handymen can upload profile photos to this endpoint")

    try:
        # Read file data
        file_data = await file.read()

        # Get file extension
        filename = file.filename or "profile.jpg"
        ext = filename.split(".")[-1].lower()

        # Validate file type
        allowed_extensions = ["jpg", "jpeg", "png", "gif", "webp"]
        if ext not in allowed_extensions:
            raise HTTPException(400, detail=f"Invalid file type. Allowed: {', '.join(allowed_extensions)}")

        # Upload to handyman profile path
        url = await storage_provider.upload_handyman_profile_photo(
            file_data=file_data,
            handyman_id=current_user.id,
            filename=filename,
            extension=ext
        )

        # Update user profile_photo field in database
        await db.users.update_one(
            {"id": current_user.id},
            {"$set": {"profile_photo": url, "updated_at": datetime.utcnow().isoformat()}}
        )

        return {"success": True, "url": url, "message": "Profile photo uploaded successfully"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Profile photo upload error: {str(e)}")
        raise HTTPException(500, detail=f"Upload failed: {str(e)}")

'''

    # Insert before contractor profile photo endpoint
    insert_pos = content.index(contractor_endpoint_marker)
    new_content = content[:insert_pos] + handyman_endpoint + '\n' + content[insert_pos:]

    with open('server.py', 'w', encoding='utf-8') as f:
        f.write(new_content)

    print("[OK] Added POST /handyman/profile-photo/upload endpoint")
    return True

if __name__ == "__main__":
    success = add_handyman_profile_photo_endpoint()
    exit(0 if success else 1)

# Photo Upload Debug Plan

## Problem
Photos fail to upload/load. This is the critical blocker for the application.

## Coordination Strategy
- **Server-side Claude**: Fix backend Linode connectivity
- **Local Claude**: Test frontend photo upload flow

## Server-Side Tasks (Priority Order)

### 1. Run Diagnostic Script
```bash
cd /srv/handyman-app/Handyman-app-main
python3 test_linode_debug.py
```

This will test:
- ✓ Environment variables loaded
- ✓ S3 client creation
- ✓ Bucket access
- ✓ Upload test
- ✓ Download test
- ✓ Public URL generation

### 2. Fix providers.env if needed
Current server credentials (from earlier check):
```
LINODE_ACCESS_KEY=YU7EQT5AL657O8QCF8J9
LINODE_SECRET_KEY=n42zMW7lsqAlkqDFW5SoKgf70fvfJUaQWWdWy7W5
LINODE_BUCKET_NAME=handyman-photos-prod
```

**Verify these are correct in Linode dashboard**

### 3. Enable storage_provider in server.py
File: `/srv/handyman-app/Handyman-app-main/backend/server.py`
Line 85: Change from `storage_provider = None` to:
```python
storage_provider = LinodeObjectStorage()
```

### 4. Restart backend
```bash
systemctl restart handyman-api
systemctl status handyman-api
journalctl -u handyman-api -n 50 --no-pager
```

### 5. Test photo upload endpoint
```bash
# Test if endpoint exists
curl -X POST http://localhost:8001/api/photos/upload \
  -H "Authorization: Bearer <token>" \
  -F "photo=@test-image.jpg"
```

## Local-Side Tasks

### 1. Check frontend photo upload code
- Verify FormData is constructed correctly
- Check Content-Type headers
- Verify auth token is included

### 2. Test upload flow
- Open frontend
- Try to upload a photo
- Monitor browser console for errors
- Check Network tab for failed requests

### 3. Check backend response
Monitor what the backend returns:
- 403 Forbidden? → Credentials issue
- 500 Internal Server Error? → Check server logs
- 404 Not Found? → storage_provider not initialized

## Common Issues & Solutions

### Issue: 403 Forbidden
**Cause**: Wrong credentials or bucket permissions
**Fix**:
1. Verify credentials in Linode dashboard
2. Check bucket ACL/permissions
3. Ensure bucket exists and is in correct region

### Issue: storage_provider = None
**Cause**: Provider disabled during earlier debugging
**Fix**: Re-enable in server.py line 85 after credentials are fixed

### Issue: Bucket not found (404)
**Cause**: Bucket name mismatch or doesn't exist
**Fix**:
1. Create bucket in Linode: `handyman-photos-prod`
2. Set region: us-iad-10 (Washington DC)
3. Update LINODE_BUCKET_NAME in providers.env

### Issue: Network timeout
**Cause**: Firewall blocking Linode API
**Fix**: Check server firewall rules, ensure outbound HTTPS allowed

## Success Criteria
✅ test_linode_debug.py passes all tests
✅ storage_provider initialized without errors
✅ Backend health check shows storage: connected
✅ Frontend can upload photo
✅ Photo URL is returned
✅ Photo can be viewed/downloaded

## Next Steps After Fix
1. Test full quote submission with photos
2. Verify photos are stored with proper metadata
3. Test photo retrieval/display
4. Update CLAUDE.md with working configuration
5. Commit fixes to merged branch

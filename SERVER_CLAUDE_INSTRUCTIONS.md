# Instructions for Server-Side Claude

## Your Mission
Fix Linode Object Storage so photos can upload. Document everything in `LINODE_STATUS.md` and push to dev branch.

## Step-by-Step Tasks

### 1. Run Diagnostic Script
```bash
cd /srv/handyman-app/Handyman-app-main
python3 test_linode_debug.py
```

**Document results in LINODE_STATUS.md:**
- Which tests passed ✅
- Which tests failed ❌
- Exact error messages
- Current credentials being used

### 2. Fix Issues Found

**If credentials are wrong:**
- Check Linode dashboard for correct keys
- Update `/srv/handyman-app/Handyman-app-main/backend/providers/providers.env`
- Verify bucket name: Should match what's in Linode dashboard
- Verify region: us-iad-10

**If bucket doesn't exist:**
- Create it in Linode dashboard: region us-iad-10
- Name it whatever LINODE_BUCKET_NAME says in providers.env

**If permissions issue (403):**
- Check bucket ACL in Linode dashboard
- Access key needs read/write permissions

### 3. Re-enable Storage Provider
Edit: `/srv/handyman-app/Handyman-app-main/backend/server.py`

Find line ~85 (search for `storage_provider`):
```python
# Change from:
storage_provider = None

# To:
storage_provider = LinodeObjectStorage()
```

### 4. Restart Backend
```bash
systemctl restart handyman-api
sleep 3
systemctl status handyman-api
```

**Check logs for storage initialization:**
```bash
journalctl -u handyman-api -n 30 --no-pager | grep -i linode
```

Should see: "✅ HEAD bucket ok" or similar

### 5. Test Health Endpoint
```bash
curl http://localhost:8001/api/health
```

Should return `"storage": "connected"` or similar

### 6. Document Everything

Create/update `LINODE_STATUS.md` with:
```markdown
# Linode Status Report

## Diagnostic Results
- Test 1: Environment variables: ✅/❌
- Test 2: S3 client creation: ✅/❌
- Test 3: Bucket access: ✅/❌
- Test 4: Upload test: ✅/❌
- Test 5: Download test: ✅/❌

## Credentials Used
- Access Key: [first 8 chars]
- Bucket: [name]
- Region: [region]
- Endpoint: [url]

## Errors Encountered
[Paste any error messages]

## Fixes Applied
- [ ] Updated credentials
- [ ] Created bucket
- [ ] Fixed permissions
- [ ] Re-enabled storage_provider
- [ ] Restarted service

## Final Status
Backend storage: ✅ Working / ❌ Still broken

## Next Steps for Local Claude
[What needs to be tested on frontend]
```

### 7. Commit and Push
```bash
cd /srv/handyman-app/Handyman-app-main
git add LINODE_STATUS.md backend/providers/providers.env backend/server.py
git commit -m "Fix Linode storage configuration"
git push origin dev
```

### 8. Tell User You're Done
Message user: "Server-side fixes complete. Status pushed to dev branch."

---

## Communication Protocol
- **You → Git**: Write status to LINODE_STATUS.md, push to dev
- **User → Local Claude**: "Server Claude is done, pull dev branch"
- **Local Claude → Git**: Pull dev, read LINODE_STATUS.md, continue testing
- **Local Claude → Git**: Test results to FRONTEND_TESTS.md, push to dev
- **You ← Git**: Pull and see if more fixes needed

## Important Notes
- Work on `dev` branch, NOT `merged`
- Document everything - errors, fixes, results
- Push changes after each major step
- Don't proceed if critical error (tell user)

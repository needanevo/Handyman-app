# Contractor Data Storage Guide

## Where Contractor Information is Stored

### 1. **MongoDB Database** (Primary Storage)
**Location**: MongoDB Atlas cluster
**Database Name**: From `DB_NAME` in `backend/providers/providers.env`
**Collection**: `users`

**Contractor Document Structure**:
```json
{
  "_id": ObjectId("..."),
  "id": "uuid-string",
  "email": "contractor@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "(555) 123-4567",
  "role": "technician",
  "is_active": true,

  // Contractor-specific fields
  "business_name": "John's Handyman Services",
  "skills": ["Drywall", "Painting", "Electrical"],
  "years_experience": 10,
  "service_areas": ["21201", "21202"],

  // Documents (photo URLs from Linode)
  "documents": {
    "license": "https://photos.us-iad-10.linodeobjects.com/customers/USER_ID/...",
    "business_license": ["https://...", "https://..."],
    "insurance": "https://..."
  },

  // Portfolio photos
  "portfolio_photos": [
    "https://photos.us-iad-10.linodeobjects.com/customers/USER_ID/...",
    "https://..."
  ],

  // Business address
  "addresses": [{
    "id": "uuid",
    "street": "123 Main St",
    "city": "Baltimore",
    "state": "MD",
    "zip_code": "21201",
    "latitude": 39.2904,
    "longitude": -76.6122,
    "is_default": true
  }],

  "created_at": "2025-11-13T...",
  "updated_at": "2025-11-13T..."
}
```

### 2. **Linode Object Storage** (Photo Files)
**Location**: Linode Object Storage (S3-compatible)
**Bucket**: `photos` (configured in `providers.env`)
**Endpoint**: `photos.us-iad-10.linodeobjects.com`

**Photo Path Structure**:
```
customers/{customer_id}/quotes/temp_{uuid}/{photo_name}.jpg
```

**Example Photo URL**:
```
https://photos.us-iad-10.linodeobjects.com/customers/a307cf36-eb24-4d61-93a0-53605fc4f956/quotes/temp_abc123/photo_random.jpg
```

---

## How to Access Contractor Data

### **Method 1: Using the Check Script** (Easiest)

```bash
# On server
cd /srv/handyman-app/Handyman-app-main
venv/bin/python check_contractor_data.py cipherbmw@gmail.com

# Output shows:
# - Basic info
# - Documents (with URLs)
# - Portfolio photos (with URLs)
# - Addresses
# - Skills
# - Raw JSON data
```

### **Method 2: Direct MongoDB Query**

```bash
# SSH to server
ssh root@172.234.70.157

# Access MongoDB shell (if mongo client installed locally)
# OR use MongoDB Compass GUI with connection string from providers.env

# Python script to query:
cd /srv/handyman-app/Handyman-app-main
venv/bin/python -c "
import asyncio, os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import json

load_dotenv('backend/providers/providers.env')

async def get_contractor():
    client = AsyncIOMotorClient(os.getenv('MONGO_URL'))
    db = client[os.getenv('DB_NAME')]

    contractor = await db.users.find_one({'email': 'cipherbmw@gmail.com'})
    print(json.dumps(contractor, indent=2, default=str))

    client.close()

asyncio.run(get_contractor())
"
```

### **Method 3: Backend API**

```bash
# Login first to get token
curl -X POST http://172.234.70.157:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"cipherbmw@gmail.com","password":"$1Jennifer"}'

# Use token to get user data
curl http://172.234.70.157:8001/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## The Photo Storage Issue (CURRENT BUG)

### **Problem Identified**:

For contractor `cipherbmw@gmail.com`:
- **UI Shows**: 2 driver's license photos, 5 business licenses, 3 insurance docs
- **Database Shows**: NO documents stored (all null)
- **Root Cause**: Photos are uploaded to Linode but URLs are never saved to MongoDB

### **Why This Happens**:

1. **PhotoUploader** component uploads to Linode successfully via `/api/photos/upload`
2. Photo URLs are stored in **component state** (React state)
3. When user navigates to next step, URLs are passed as **route params**
4. **BUT** these URLs are NEVER saved to the database!
5. When user returns to edit, `useEffect` tries to load from `user.documents` (which is null)
6. State shows photos exist (from params or previous session storage)
7. But no actual photos can be displayed because URLs are not persisted

### **The Missing Save Logic**:

Current flow:
```
Step 2: Upload photos → Linode (✅ works)
Step 2: Store URLs in state (✅ works)
Step 2: Pass URLs as params (✅ works)
Step 3: [MISSING] Save documents to database (❌ MISSING)
```

---

## How to Fix Photo Storage

### **Solution 1: Add API Endpoint to Save Documents**

Create endpoint to save contractor documents:

```python
# backend/server.py

@api_router.patch("/contractors/documents")
async def update_contractor_documents(
    documents: dict,
    current_user: User = Depends(get_current_user_dependency)
):
    """Update contractor documents"""
    if current_user.role != UserRole.TECHNICIAN:
        raise HTTPException(403, "Only contractors can update documents")

    await db.users.update_one(
        {"id": current_user.id},
        {"$set": {
            "documents": documents,
            "updated_at": datetime.utcnow().isoformat()
        }}
    )

    return {"message": "Documents updated successfully"}
```

### **Solution 2: Update Frontend to Save Documents**

```typescript
// frontend/app/auth/contractor/register-step2.tsx

const onContinue = async () => {
  if (driversLicense.length === 0) {
    alert("Please upload your driver's license");
    return;
  }

  try {
    setIsLoading(true);

    // Save documents to database
    await contractorAPI.updateDocuments({
      license: driversLicense[0],
      business_license: businessLicenses,
      insurance: insurance[0],
    });

    // Navigate to next step
    router.push({
      pathname: '/auth/contractor/register-step3',
      params,
    });
  } catch (error) {
    Alert.alert('Error', 'Failed to save documents');
  } finally {
    setIsLoading(false);
  }
};
```

---

## How to Remove Photo Remnants

### **For UI State (Component State)**

The "phantom photos" showing in UI are from:
1. React component state persisting across page refreshes
2. Route params carrying stale data

**Fix**: Clear browser cache and local storage
```javascript
// In browser console
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### **For Database Records**

Use the cleanup script:

```bash
# Dry run (shows what would be cleared)
ssh root@172.234.70.157 'cd /srv/handyman-app/Handyman-app-main && venv/bin/python check_contractor_data.py cipherbmw@gmail.com'

# Actually clear all photo references
ssh root@172.234.70.157 'cd /srv/handyman-app/Handyman-app-main && venv/bin/python check_contractor_data.py cipherbmw@gmail.com clear'
# Then type "YES" when prompted
```

### **For Linode Object Storage**

Photos in Linode won't be automatically deleted. You'll need to:

1. **List all photos for a user**:
```python
from backend.providers.linode_storage_provider import LinodeObjectStorage

storage = LinodeObjectStorage()
user_id = "a307cf36-eb24-4d61-93a0-53605fc4f956"
prefix = f"customers/{user_id}/"

# List all files
files = storage.list_files(prefix)
```

2. **Delete orphaned photos** (files not referenced in database)

---

## Quick Reference: Common Tasks

### Check Contractor Data
```bash
ssh root@172.234.70.157 'cd /srv/handyman-app/Handyman-app-main && venv/bin/python check_contractor_data.py EMAIL'
```

### Clear Phantom Photo References
```bash
# In contractor's browser
localStorage.clear();
sessionStorage.clear();

# OR clear database documents
ssh root@172.234.70.157 'cd /srv/handyman-app/Handyman-app-main && venv/bin/python check_contractor_data.py EMAIL clear'
```

### Update Contractor Manually
```python
# Via Python script on server
import asyncio, os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv('backend/providers/providers.env')

async def update():
    client = AsyncIOMotorClient(os.getenv('MONGO_URL'))
    db = client[os.getenv('DB_NAME')]

    await db.users.update_one(
        {"email": "cipherbmw@gmail.com"},
        {"$set": {
            "documents": {
                "license": "https://...",
                "business_license": ["https://..."],
                "insurance": "https://..."
            }
        }}
    )

    client.close()

asyncio.run(update())
```

---

## Next Steps

1. ✅ **Immediate**: Clear phantom photos for `cipherbmw@gmail.com` (use script above)
2. 🔧 **Short-term**: Implement document save endpoint + frontend integration
3. 🔍 **Long-term**: Add photo reference validation and orphaned file cleanup

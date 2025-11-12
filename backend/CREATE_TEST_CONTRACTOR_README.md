# Creating Test Contractor Account

This guide provides multiple methods to create a test contractor account for testing the contractor dashboard.

## Test Contractor Credentials

```
Email: contractor@test.com
Password: TestContractor123!
Role: TECHNICIAN
```

---

## Method 1: Run Script on Production Server (Recommended)

SSH into your production server and run the script:

```bash
# SSH into server
ssh root@172.234.70.157

# Navigate to project directory
cd /srv/handyman-app/Handyman-app-main

# Activate virtual environment
source venv/bin/activate

# Run the script
python backend/create_test_contractor.py
```

The script will:
- Check if contractor already exists
- Create user document with contractor-specific fields
- Hash password securely with bcrypt
- Set registration date to today
- Set expiration date to 1 year from now
- Output the credentials for you to use

---

## Method 2: Use Backend API Directly

You can also create the contractor by sending a POST request to your registration endpoint:

```bash
curl -X POST http://172.234.70.157:8001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "contractor@test.com",
    "password": "TestContractor123!",
    "firstName": "John",
    "lastName": "Contractor",
    "phone": "555-0123",
    "role": "technician"
  }'
```

Then, you'll need to manually update the user document in MongoDB to add contractor-specific fields:

```javascript
// Connect to MongoDB Atlas
db.users.updateOne(
  { email: "contractor@test.com" },
  {
    $set: {
      business_name: "John's Handyman Services",
      skills: ["Drywall", "Painting", "Electrical", "Plumbing", "Carpentry"],
      service_areas: ["21201", "21202", "21203", "21224", "21231"],
      years_experience: 10,
      registration_completed_date: new Date().toISOString(),
      registration_expiration_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
      registration_status: "ACTIVE",
      last_renewal_date: null,
      renewal_notifications_sent: {
        thirty_day: false,
        seven_day: false,
        expiration: false
      },
      portfolio_photos: [],
      documents: {
        license: null,
        insurance: null,
        certifications: []
      }
    }
  }
)
```

---

## Method 3: Complete Registration Flow

The most realistic approach is to go through the actual registration process:

1. Open the app and navigate to contractor registration
2. Fill out all 4 steps with test data:
   - **Step 1**: Use contractor@test.com and TestContractor123!
   - **Step 2**: Upload test documents (licenses, insurance)
   - **Step 3**: Add skills and service areas
   - **Step 4**: Upload portfolio photos

This will create a fully complete contractor profile that matches production usage.

---

## Verifying the Account

After creating the account, verify it works:

1. **Test Login**:
   ```bash
   curl -X POST http://172.234.70.157:8001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "contractor@test.com",
       "password": "TestContractor123!"
     }'
   ```

2. **Check User Profile**:
   - Log in to the app with contractor@test.com
   - Navigate to contractor dashboard
   - Verify all fields are populated
   - Check registration status shows "ACTIVE"
   - Verify expiration date is ~365 days from now

3. **Test Navigation**:
   - Click on registration steps (should be clickable)
   - Navigate to profile/settings
   - Verify can edit profile information

---

## Troubleshooting

**"User already exists" error**:
- The contractor was already created
- You can use the existing account
- Or delete it first: `db.users.deleteOne({ email: "contractor@test.com" })`
- Also delete password: `db.user_passwords.deleteOne({ user_id: "<user_id>" })`

**"Cannot connect to MongoDB" error**:
- Make sure you're running on the production server
- Check `backend/providers/providers.env` has correct MONGO_URL
- Verify MongoDB Atlas IP whitelist includes your server IP

**"Import error" when running script**:
- Make sure virtual environment is activated
- Run: `pip install -r backend/requirements.txt`

**"Permission denied" error**:
- You may need sudo: `sudo python backend/create_test_contractor.py`
- Or run as the app user

---

## Next Steps

After creating the test contractor:

1. ✅ Log in to contractor dashboard
2. ✅ Test registration step navigation
3. ✅ Test profile editing
4. ⏳ Implement annual renewal system
5. ⏳ Test expiration warnings
6. ⏳ Test grace period logic

See `.github/CONTRACTOR_REGISTRATION_SYSTEM.md` for full implementation plan.

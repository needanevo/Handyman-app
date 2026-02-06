# Admin Promotion Guide

This document provides instructions for promoting a user to admin role in the Handyman App.

## Methods to Promote a User to Admin

### Method 1: Using the Python Script (Recommended)

Run the promotion script from the backend directory:

```bash
cd backend
python promote_to_admin.py --email user@example.com
```

Or with optional flags:
```bash
# Promote with custom role level
python promote_to_admin.py --email user@example.com --role super_admin

# Promote without confirmation prompt
python promote_to_admin.py --email user@example.com --force
```

### Method 2: Direct MongoDB Update

Connect to MongoDB and update the user's role directly:

```javascript
// Connect to MongoDB
use handyman_app

// Find the user
db.users.findOne({ email: "user@example.com" })

// Update the role to admin
db.users.updateOne(
  { email: "user@example.com" },
  { $set: { role: "admin", role_level: 1 } }
)
```

### Method 3: MongoDB Compass

1. Open MongoDB Compass
2. Connect to your MongoDB instance
3. Navigate to the `handyman_app` database
4. Find the `users` collection
5. Locate the user by email
6. Edit the document:
   - Set `role` to `"admin"`
   - Set `role_level` to `1` (or appropriate level)

### Method 4: Using mongosh

```bash
mongosh "mongodb://localhost:27017/handyman_app" --eval '
db.users.updateOne(
  { email: "user@example.com" },
  { $set: { role: "admin", role_level: 1 } }
)
'
```

## Role Levels

| Level | Role | Permissions |
|-------|------|-------------|
| 1 | admin | Full dashboard access, user management |
| 2 | super_admin | All admin permissions + system config |

## Verification

After promotion, verify the user can access the admin dashboard:

1. Log in as the promoted user
2. Navigate to the admin dashboard (should see admin link in header)
3. Check that stats and management options are visible

## Removing Admin Access

To remove admin access:

```bash
cd backend
python promote_to_admin.py --email user@example.com --remove
```

Or via MongoDB:
```javascript
db.users.updateOne(
  { email: "user@example.com" },
  { $set: { role: "customer", role_level: 0 } }
)
```

## Troubleshooting

### User cannot access admin dashboard
- Ensure the user has `role: "admin"` in their document
- Check that `role_level` is set (1 or higher)
- Clear app cache and re-login
- Check backend logs for authentication errors

### Role not saving
- Verify MongoDB connection is working
- Ensure the user document exists
- Check for typos in the email address

### Permission denied errors
- Ensure the backend is running
- Check that `require_admin` dependency is correctly applied to endpoints
- Verify the JWT token contains the correct role

## Admin Dashboard Features

After promotion, admins can access:

- **Dashboard Stats**: Users, jobs, revenue overview
- **Contractor Management**: View, approve, deactivate contractors
- **Customer Management**: View customer history and accounts
- **Job Management**: View all jobs, assign contractors, adjust pricing
- **Quote Management**: Send and manage quotes
- **Provider Gate Configuration**: System-wide settings

## Security Notes

- Only promote trusted users to admin
- Super admin access should be limited to a few trusted individuals
- Regularly audit admin user list
- Consider implementing two-factor authentication for admin accounts

# Admin Dashboard Guide

**The Real Johnson Handyman Services - Administrator Documentation**

---

## Table of Contents

1. [Creating an Admin Account](#creating-an-admin-account)
2. [Logging In as Admin](#logging-in-as-admin)
3. [Admin Dashboard Overview](#admin-dashboard-overview)
4. [Contractor Management](#contractor-management)
5. [Customer Management](#customer-management)
6. [Jobs Management](#jobs-management)
7. [Common Tasks & Workflows](#common-tasks--workflows)
8. [API Endpoints Reference](#api-endpoints-reference)

---

## Creating an Admin Account

### Method 1: Using MongoDB Compass (Recommended)

1. **Open MongoDB Compass** and connect to your MongoDB Atlas cluster:
   ```
   mongodb+srv://needanevo:$1Jennifer@cluster0.d5iqsxn.mongodb.net/?appName=Cluster0&w=majority&tlsAllowInvalidCertificates=true
   ```

2. **Navigate to the `users` collection**:
   - Database: `handyman_app` (or your configured DB name)
   - Collection: `users`

3. **Insert a new admin user document**:
   ```json
   {
     "id": "admin-user-001",
     "email": "admin@therealjohnson.com",
     "first_name": "Admin",
     "last_name": "User",
     "phone": "+1234567890",
     "role": "ADMIN",
     "addresses": [],
     "created_at": { "$date": "2025-11-20T00:00:00.000Z" },
     "updated_at": { "$date": "2025-11-20T00:00:00.000Z" }
   }
   ```

4. **Create password in `user_passwords` collection**:
   ```json
   {
     "user_id": "admin-user-001",
     "password_hash": "$2b$12$YOUR_BCRYPT_HASH_HERE"
   }
   ```

   **To generate a bcrypt hash**, use this Python script:
   ```python
   import bcrypt

   password = "YourSecurePassword123!"
   hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
   print(hashed.decode('utf-8'))
   ```

### Method 2: Using Python Script

Create a file `backend/create_admin_user.py`:

```python
import asyncio
import bcrypt
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import uuid

async def create_admin_user():
    # Connect to MongoDB
    client = AsyncIOMotorClient("mongodb+srv://needanevo:$1Jennifer@cluster0.d5iqsxn.mongodb.net/?appName=Cluster0&w=majority&tlsAllowInvalidCertificates=true")
    db = client["handyman_app"]

    # Admin user details
    admin_id = str(uuid.uuid4())
    email = "admin@therealjohnson.com"
    password = "AdminPassword123!"  # Change this!

    # Check if admin already exists
    existing = await db.users.find_one({"email": email})
    if existing:
        print(f"Admin user with email {email} already exists!")
        return

    # Create admin user
    admin_user = {
        "id": admin_id,
        "email": email,
        "first_name": "Admin",
        "last_name": "User",
        "phone": "+1234567890",
        "role": "ADMIN",
        "addresses": [],
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }

    # Hash password
    password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    # Insert user
    await db.users.insert_one(admin_user)

    # Insert password
    await db.user_passwords.insert_one({
        "user_id": admin_id,
        "password_hash": password_hash
    })

    print(f"✅ Admin user created successfully!")
    print(f"Email: {email}")
    print(f"Password: {password}")
    print(f"User ID: {admin_id}")
    print(f"\n⚠️  IMPORTANT: Change the password after first login!")

if __name__ == "__main__":
    asyncio.run(create_admin_user())
```

**Run the script**:
```bash
cd backend
python create_admin_user.py
```

---

## Logging In as Admin

1. **Open the app** (web or mobile)
2. **Navigate to Login screen**
3. **Enter admin credentials**:
   - Email: `admin@therealjohnson.com`
   - Password: `AdminPassword123!` (or your chosen password)
4. **Tap "Sign In"**

**✅ You will be automatically redirected to the Admin Dashboard**

---

## Admin Dashboard Overview

The Admin Dashboard is the central hub for managing your handyman platform. It displays real-time statistics and provides quick access to all management tools.

### Dashboard Sections

#### 1. **Users Statistics** 📊

Displays comprehensive user metrics:

| Metric | Description | Icon |
|--------|-------------|------|
| **Total Customers** | Count of all registered customer accounts | 👥 People |
| **Total Contractors** | Count of all registered contractor accounts | 🔨 Construct |
| **Active Contractors** | Contractors with ACTIVE registration status | ✅ Checkmark Circle |
| **New Customers (Week)** | Customers who registered in the last 7 days | 📈 Trending Up |
| **New Contractors (Week)** | Contractors who registered in the last 7 days | 📈 Trending Up |

**What to look for:**
- Steady growth in new customers and contractors
- High percentage of active contractors (indicates healthy platform)
- Compare weekly growth trends

---

#### 2. **Jobs Statistics** 📋

Track all jobs on the platform:

| Metric | Description | Status |
|--------|-------------|--------|
| **Total Jobs** | All jobs ever created | All statuses |
| **Pending** | Jobs awaiting contractor acceptance | ⏰ Needs attention |
| **In Progress** | Jobs currently being worked on | 🔨 Active |
| **Completed** | Successfully finished jobs | ✅ Done |
| **Completed This Month** | Jobs finished in current month | 📅 Monthly KPI |
| **Completed This Week** | Jobs finished in last 7 days | 📅 Weekly KPI |

**What to look for:**
- High completion rate (completed / total)
- Low number of pending jobs (shows contractors are responsive)
- Increasing monthly/weekly completions (growth indicator)

---

#### 3. **Revenue Statistics** 💰

Monitor platform earnings:

| Metric | Description |
|--------|-------------|
| **Total Revenue** | All-time earnings from completed jobs |
| **This Month** | Revenue generated in current month |

**What to look for:**
- Consistent monthly revenue growth
- Revenue per completed job (total revenue / completed jobs)

---

#### 4. **Management Quick Links** 🔗

Three main management sections accessible from dashboard:

1. **Contractors** 🔨
   - Manage contractor accounts and assignments
   - View contractor performance and statistics

2. **Customers** 👥
   - View customer accounts and history
   - Track customer spending and engagement

3. **Jobs** 💼
   - View and manage all jobs
   - Filter by status and assign contractors

---

## Contractor Management

**Path**: Admin Dashboard → Contractors

### Features

#### Search & Filter
- **Search bar**: Find contractors by name, email, or business name
- **Filter buttons**:
  - **All**: Show all contractors
  - **Active**: Only show contractors with active registration
  - **Expired**: Only show contractors with expired registration

#### Contractor Cards

Each contractor card displays:

```
┌─────────────────────────────────────────────┐
│ John Smith                    [ACTIVE]      │
│ John's Handyman Services                    │
│ john@example.com                            │
│                                             │
│ 💼 12 total jobs  ✅ 10 completed          │
│ 💰 $4,500 earned                           │
│                                             │
│ Skills: Drywall, Painting, Electrical +2   │
└─────────────────────────────────────────────┘
```

**Card Information:**
- **Name**: Contractor's first and last name
- **Business Name**: Their registered business name
- **Email**: Contact email address
- **Status Badge**: ACTIVE or EXPIRED (color coded)
- **Total Jobs**: All jobs ever assigned to this contractor
- **Completed Jobs**: Successfully finished jobs
- **Total Revenue**: Sum of all earnings from completed jobs
- **Skills**: First 3 skills shown, with "+X more" indicator

#### What You Can Do

1. **Search for specific contractors**
   - Type name, email, or business name in search bar
   - Results filter in real-time

2. **Filter by registration status**
   - Tap "Active" to see only active contractors
   - Tap "Expired" to identify contractors needing renewal
   - Tap "All" to see everyone

3. **View contractor details** (future feature)
   - Tap on a contractor card to see full profile
   - View all jobs assigned to this contractor
   - See registration documents and portfolio

4. **Monitor contractor performance**
   - Compare completed jobs vs total jobs (completion rate)
   - Track earnings per contractor
   - Identify top performers

---

## Customer Management

**Path**: Admin Dashboard → Customers

### Features

#### Search
- **Search bar**: Find customers by name, email, or phone number

#### Customer Cards

Each customer card displays:

```
┌─────────────────────────────────────────────┐
│ Jane Doe                                    │
│ jane@example.com                            │
│ +1 (555) 123-4567                          │
│                                             │
│ 💼 5 total jobs  ✅ 4 completed            │
│ 💰 $2,300 spent                            │
│                                             │
│ 📍 Milford, DE                             │
└─────────────────────────────────────────────┘
```

**Card Information:**
- **Name**: Customer's first and last name
- **Email**: Contact email address
- **Phone**: Phone number (if provided)
- **Total Jobs**: All jobs this customer has requested
- **Completed Jobs**: Successfully finished jobs
- **Total Spent**: Sum of all payments for completed jobs
- **Location**: City and state from primary address

#### What You Can Do

1. **Search for specific customers**
   - Type name, email, or phone number
   - Results filter in real-time

2. **Monitor customer activity**
   - See which customers are most active (high job count)
   - Track high-value customers (high total spent)
   - Identify customers with incomplete jobs

3. **View customer details** (future feature)
   - Tap on customer card for full profile
   - See complete job history
   - View all addresses and contact information

---

## Jobs Management

**Path**: Admin Dashboard → Jobs

### Features

#### Status Filters

Filter jobs by status using horizontal scroll buttons:

| Filter | Shows Jobs With Status | Color |
|--------|------------------------|-------|
| **All** | All statuses | - |
| **Requested** | Customer submitted, awaiting quote | 🟡 Yellow |
| **Quoted** | Contractor provided quote | 🔵 Blue |
| **Accepted** | Customer accepted quote | 🟢 Green |
| **In Progress** | Work currently underway | 🟢 Green |
| **Completed** | Work finished successfully | 🟢 Green |
| **Cancelled** | Job was cancelled | ⚪ Gray |

#### Job Cards

Each job card displays:

```
┌─────────────────────────────────────────────┐
│ Kitchen Faucet Replacement    [IN PROGRESS] │
│                                             │
│ Replace old leaky faucet with new modern... │
│                                             │
│ 👤 Jane Doe                                │
│ 🔨 John Smith                              │
│                                             │
│ 📅 Nov 15, 2025              $350          │
└─────────────────────────────────────────────┘
```

**Card Information:**
- **Service Category**: Type of service (e.g., "Plumbing", "Electrical")
- **Status Badge**: Current job status with color coding
- **Description**: First 2 lines of job description
- **Customer Name**: Who requested the job
- **Contractor Name**: Who is assigned (if assigned)
- **Created Date**: When job was requested
- **Estimated Amount**: Quote amount or estimated total

#### What You Can Do

1. **Filter jobs by status**
   - Tap any status button to filter
   - Scroll horizontally to see all status options
   - Tap "All" to clear filter

2. **Monitor job pipeline**
   - See how many jobs are pending (need attention)
   - Track jobs in progress
   - Review completed jobs

3. **Identify bottlenecks**
   - High "Requested" count = not enough contractors responding
   - High "Quoted" count = customers not accepting quotes
   - High "In Progress" count = jobs taking too long

4. **Assign jobs to contractors** (future feature)
   - Manually assign unassigned jobs to specific contractors
   - Override contractor assignments if needed

---

## Common Tasks & Workflows

### Task 1: Monitor Platform Health

**Daily Check** (5 minutes):
1. Open Admin Dashboard
2. Check **Pending Jobs** count
   - ⚠️ If high: Contact contractors to claim jobs
3. Check **New Users This Week**
   - 📈 Track growth trends
4. Review **Revenue This Month**
   - 💰 Compare to previous months

---

### Task 2: Find Top Performing Contractors

1. Navigate to **Contractors**
2. Tap **Active** filter
3. Scroll through list and note:
   - Contractors with highest **completed jobs**
   - Contractors with highest **total revenue**
4. Click on top performers to see details (future)

---

### Task 3: Identify High-Value Customers

1. Navigate to **Customers**
2. Scroll through list and note customers with:
   - High **total spent** amount
   - High **total jobs** count
3. These are your VIP customers - ensure quality service

---

### Task 4: Review Expired Contractors

1. Navigate to **Contractors**
2. Tap **Expired** filter
3. Review list of contractors needing renewal
4. Contact them via email/phone to renew registration

---

### Task 5: Track Job Completion Rate

1. Navigate to **Jobs**
2. Tap **All** to see total jobs
3. Note total count (e.g., 50 jobs)
4. Tap **Completed** to see finished jobs
5. Note completed count (e.g., 35 jobs)
6. Calculate: `35/50 = 70% completion rate`
7. **Target**: 80%+ completion rate

---

### Task 6: Weekly Performance Report

**Every Monday**:
1. Open Admin Dashboard
2. Record these metrics:
   - New customers this week
   - New contractors this week
   - Jobs completed this week
   - Revenue this month
3. Compare to previous week's numbers
4. Identify trends (growth, decline, plateau)

---

## API Endpoints Reference

### Admin Authentication

All admin endpoints require authentication with admin role.

**Request Header:**
```
Authorization: Bearer {your_admin_jwt_token}
```

---

### Dashboard Statistics

**Endpoint**: `GET /api/admin/dashboard/stats`

**Response**:
```json
{
  "users": {
    "total_customers": 150,
    "total_contractors": 25,
    "active_contractors": 20,
    "new_customers_this_week": 12,
    "new_contractors_this_week": 3
  },
  "jobs": {
    "total": 200,
    "pending": 15,
    "in_progress": 8,
    "completed": 165,
    "cancelled": 12,
    "completed_this_month": 45,
    "completed_this_week": 12
  },
  "revenue": {
    "total": 85000.00,
    "this_month": 12500.00
  }
}
```

---

### List All Contractors

**Endpoint**: `GET /api/admin/contractors`

**Query Parameters**:
- `status` (optional): Filter by registration status
- `skills` (optional): Filter by skill keyword
- `min_rating` (optional): Minimum rating (future)

**Response**:
```json
[
  {
    "id": "contractor-id-123",
    "first_name": "John",
    "last_name": "Smith",
    "email": "john@example.com",
    "business_name": "John's Handyman Services",
    "registration_status": "ACTIVE",
    "skills": ["Drywall", "Painting", "Electrical"],
    "total_jobs": 12,
    "completed_jobs": 10,
    "total_revenue": 4500.00
  }
]
```

---

### List All Customers

**Endpoint**: `GET /api/admin/customers`

**Query Parameters**:
- `min_jobs` (optional): Minimum job count
- `min_spent` (optional): Minimum spending amount

**Response**:
```json
[
  {
    "id": "customer-id-456",
    "first_name": "Jane",
    "last_name": "Doe",
    "email": "jane@example.com",
    "phone": "+15551234567",
    "addresses": [
      {
        "street": "123 Main St",
        "city": "Milford",
        "state": "DE",
        "zip_code": "19963"
      }
    ],
    "total_jobs": 5,
    "completed_jobs": 4,
    "total_spent": 2300.00
  }
]
```

---

### List All Jobs

**Endpoint**: `GET /api/admin/jobs`

**Query Parameters**:
- `status_filter` (optional): Filter by status
- `contractor_id` (optional): Filter by contractor
- `customer_id` (optional): Filter by customer

**Response**:
```json
[
  {
    "id": "job-id-789",
    "service_category": "Plumbing",
    "description": "Replace kitchen faucet",
    "status": "in_progress",
    "customer_id": "customer-id-456",
    "customer_first_name": "Jane",
    "customer_last_name": "Doe",
    "contractor_id": "contractor-id-123",
    "contractor_first_name": "John",
    "contractor_last_name": "Smith",
    "estimated_total": 350.00,
    "created_at": "2025-11-15T10:30:00Z"
  }
]
```

---

### Update Contractor Status

**Endpoint**: `PATCH /api/admin/contractors/{contractor_id}`

**Request Body**:
```json
{
  "registration_status": "ACTIVE",
  "is_active": true,
  "notes": "Verified license and insurance"
}
```

**Response**:
```json
{
  "message": "Contractor updated successfully",
  "contractor_id": "contractor-id-123"
}
```

---

### Manually Assign Job to Contractor

**Endpoint**: `PATCH /api/admin/jobs/{job_id}/assign`

**Request Body**:
```json
{
  "contractor_id": "contractor-id-123"
}
```

**Response**:
```json
{
  "message": "Job assigned successfully",
  "job_id": "job-id-789",
  "contractor_id": "contractor-id-123"
}
```

---

## Security Best Practices

### Password Security
- ✅ Use strong passwords (12+ characters, mixed case, numbers, symbols)
- ✅ Never share admin credentials
- ✅ Change default password after first login
- ✅ Use unique password (not used elsewhere)

### Access Control
- ✅ Limit admin accounts to trusted staff only
- ✅ Create separate accounts for each admin (don't share)
- ✅ Review admin activity logs regularly (future feature)

### Data Privacy
- ⚠️ Customer and contractor data is sensitive
- ⚠️ Never share user emails or phone numbers externally
- ⚠️ Follow all privacy regulations (GDPR, CCPA if applicable)

---

## Troubleshooting

### Cannot Login as Admin

**Problem**: Login redirects to customer/contractor dashboard instead of admin.

**Solution**: Check user role in MongoDB:
```javascript
db.users.findOne({ email: "admin@therealjohnson.com" })
```

Ensure `role` field is exactly `"ADMIN"` (case-sensitive).

---

### Dashboard Shows Zero Stats

**Problem**: All statistics show 0 despite having data.

**Solution**:
1. Check MongoDB connection is working
2. Verify collections exist: `users`, `jobs`, `quotes`
3. Check backend logs for errors:
   ```bash
   ssh root@172.234.70.157
   journalctl -u handyman-api -n 50
   ```

---

### "Failed to load" Error

**Problem**: Error message when opening Contractors/Customers/Jobs page.

**Solution**:
1. Check network connection
2. Verify backend API is running:
   ```bash
   curl https://therealjohnson.com/api/health
   ```
3. Check browser console for specific error
4. Verify admin JWT token is valid (try logging out and back in)

---

## Future Features (Coming Soon)

- 📊 **Advanced Analytics**: Charts and graphs for trends
- 🔔 **Notifications**: Alerts for pending jobs, expired contractors
- 📧 **Email Integration**: Send emails directly from admin dashboard
- 💬 **Messaging**: Chat with customers and contractors
- 📁 **Document Management**: View contractor licenses and insurance
- 📸 **Photo Gallery**: View job photos and portfolios
- ⭐ **Ratings & Reviews**: Moderate customer reviews
- 💳 **Payment Management**: Process refunds, view transactions
- 📱 **Mobile App**: Native iOS/Android admin app

---

## Support

For technical issues or questions:
- **Email**: admin@therealjohnson.com
- **Documentation**: `CLAUDE.md` in repository root
- **API Docs**: `https://therealjohnson.com/api/docs`

---

**Last Updated**: November 20, 2025
**Version**: 1.0.0

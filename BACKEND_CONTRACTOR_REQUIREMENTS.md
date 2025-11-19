# Backend Requirements for Contractor Dashboard

This document outlines the backend API endpoints, database collections, and data models needed to support the comprehensive contractor dashboard feature.

## Overview

The contractor dashboard enables technicians to:
- Manage jobs (available, accepted, scheduled, in-progress, completed)
- Document work with photo galleries (before/during/after photos)
- Track expenses with receipt photos
- Log mileage for tax deductions
- Generate tax reports with photo documentation
- Track time spent on jobs

---

## Database Collections

### 1. `jobs` Collection
Enhancement to existing `quotes` collection or new collection for contractor-specific job data.

```javascript
{
  _id: ObjectId,
  quote_id: String,  // Reference to original quote
  customer_id: String,
  contractor_id: String,
  status: String,  // AVAILABLE, ACCEPTED, SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED

  // Job details
  title: String,
  description: String,
  category: String,

  // Location
  location: {
    street: String,
    city: String,
    state: String,
    zip_code: String,
    latitude: Number,
    longitude: Number,
    access_notes: String  // Gate codes, parking, etc.
  },

  // Scheduling
  requested_date: ISODate,
  scheduled_date: ISODate,
  scheduled_start_time: String,  // "09:00"
  scheduled_end_time: String,    // "11:00"
  estimated_duration: Number,     // in hours

  // Financial
  estimated_cost: Number,
  quoted_amount: Number,
  final_amount: Number,
  deposit_amount: Number,
  deposit_paid: Boolean,

  // Notes
  contractor_notes: String,
  customer_requirements: String,
  special_instructions: String,

  // Timestamps
  created_at: ISODate,
  updated_at: ISODate,
  accepted_at: ISODate,
  completed_at: ISODate
}
```

**Indexes:**
- `{ contractor_id: 1, status: 1 }` - For contractor job lists
- `{ customer_id: 1 }` - For customer job tracking
- `{ scheduled_date: 1 }` - For calendar views
- `{ status: 1, created_at: -1 }` - For available jobs list

---

### 2. `job_photos` Collection
Stores all job-related photos with metadata.

```javascript
{
  _id: ObjectId,
  job_id: String,
  uploaded_by: String,  // contractor_id or customer_id

  // Photo details
  url: String,           // Full resolution photo URL (Linode S3)
  thumbnail_url: String, // Thumbnail URL (optional)
  category: String,      // BEFORE, PROGRESS, AFTER, DETAIL, RECEIPT, DAMAGE, OTHER

  // Metadata
  caption: String,
  notes: String,
  timestamp: ISODate,    // When photo was taken

  // File info
  file_size: Number,     // in bytes
  width: Number,
  height: Number,
  mime_type: String,

  // Timestamps
  created_at: ISODate,
  updated_at: ISODate
}
```

**Indexes:**
- `{ job_id: 1, category: 1 }` - For filtering photos by category
- `{ job_id: 1, timestamp: -1 }` - For chronological photo display
- `{ uploaded_by: 1 }` - For contractor's photo portfolio

---

### 3. `expenses` Collection
Tracks job-related expenses with receipt photos.

```javascript
{
  _id: ObjectId,
  job_id: String,
  contractor_id: String,

  // Expense details
  category: String,  // MATERIALS, TOOLS, EQUIPMENT, SUBCONTRACTOR, FUEL, PERMITS, OTHER
  description: String,
  amount: Number,
  date: ISODate,
  vendor: String,
  notes: String,

  // Receipt photos
  receipt_photos: [String],  // Array of photo URLs

  // Timestamps
  created_at: ISODate,
  updated_at: ISODate
}
```

**Indexes:**
- `{ contractor_id: 1, date: -1 }` - For expense reports
- `{ job_id: 1 }` - For job-specific expenses
- `{ contractor_id: 1, category: 1, date: -1 }` - For tax reports by category

---

### 4. `mileage_logs` Collection
Tracks business mileage for tax deductions.

```javascript
{
  _id: ObjectId,
  contractor_id: String,
  job_id: String,  // Optional - may be general business trip

  // Trip details
  date: ISODate,
  start_location: {
    address: String,
    latitude: Number,
    longitude: Number
  },
  end_location: {
    address: String,
    latitude: Number,
    longitude: Number
  },
  miles: Number,
  purpose: String,
  notes: String,

  // Tracking method
  auto_tracked: Boolean,  // GPS vs manual entry
  route_data: Object,     // Optional: GPS route data for verification

  // Timestamps
  created_at: ISODate
}
```

**Indexes:**
- `{ contractor_id: 1, date: -1 }` - For mileage reports
- `{ job_id: 1 }` - For job-specific mileage

---

### 5. `time_logs` Collection
Tracks time spent on jobs.

```javascript
{
  _id: ObjectId,
  job_id: String,
  contractor_id: String,

  // Time tracking
  start_time: ISODate,
  end_time: ISODate,
  duration: Number,      // in minutes
  break_time: Number,    // in minutes (optional)

  // Notes
  notes: String,

  // Timestamps
  created_at: ISODate
}
```

**Indexes:**
- `{ job_id: 1, start_time: -1 }` - For job timelines
- `{ contractor_id: 1, start_time: -1 }` - For contractor time reports

---

## API Endpoints

### Dashboard & Stats

#### `GET /api/contractor/dashboard/stats`
Get dashboard statistics for contractor.

**Auth:** Requires TECHNICIAN or ADMIN role

**Response:**
```json
{
  "available_jobs_count": 8,
  "accepted_jobs_count": 3,
  "scheduled_jobs_count": 5,
  "completed_this_month": 12,
  "completed_year_to_date": 47,
  "revenue_this_month": 8500.00,
  "revenue_year_to_date": 42300.00,
  "expenses_this_month": 2100.00,
  "expenses_year_to_date": 9800.00,
  "profit_this_month": 6400.00,
  "profit_year_to_date": 32500.00,
  "miles_this_month": 245.5,
  "miles_year_to_date": 1823.2,
  "miles_all_time": 5642.8
}
```

---

### Jobs Management

#### `GET /api/contractor/jobs/available`
Get list of available jobs (not yet accepted).

**Auth:** Requires TECHNICIAN or ADMIN role

**Query Params:**
- `category` (optional): Filter by job category
- `zip_code` (optional): Filter by location
- `max_distance` (optional): Maximum distance in miles

**Response:**
```json
[
  {
    "id": "job123",
    "title": "Kitchen Faucet Replacement",
    "description": "...",
    "category": "Plumbing",
    "customer": {
      "first_name": "Sarah",
      "last_name": "Johnson",
      "phone": "(555) 123-4567"
    },
    "location": {
      "city": "San Francisco",
      "state": "CA",
      "zip_code": "94102"
    },
    "quoted_amount": 250.00,
    "estimated_duration": 2,
    "created_at": "2025-11-10T10:00:00Z"
  }
]
```

#### `GET /api/contractor/jobs/accepted`
Get jobs accepted but not yet scheduled.

#### `GET /api/contractor/jobs/scheduled`
Get upcoming scheduled jobs.

#### `GET /api/contractor/jobs/completed`
Get completed jobs with optional date filtering.

**Query Params:**
- `start_date` (optional): YYYY-MM-DD
- `end_date` (optional): YYYY-MM-DD

#### `GET /api/contractor/jobs/{job_id}`
Get detailed job information including photos, expenses, time logs.

**Response:**
```json
{
  "id": "job123",
  "customer": { ... },
  "status": "IN_PROGRESS",
  "title": "Kitchen Faucet Replacement",
  "description": "...",
  "location": { ... },
  "scheduled_date": "2025-11-15",
  "scheduled_start_time": "09:00",
  "quoted_amount": 250.00,
  "photos": [ ... ],  // Full photo objects
  "expenses": [ ... ],
  "time_logs": [ ... ],
  "total_expenses": 102.50,
  "total_labor_hours": 2.5,
  "contractor_notes": "..."
}
```

#### `POST /api/contractor/jobs/{job_id}/accept`
Accept an available job.

**Request Body:** `{}` (empty)

**Response:**
```json
{
  "success": true,
  "job": { ... },
  "message": "Job accepted successfully"
}
```

#### `PUT /api/contractor/jobs/{job_id}/status`
Update job status.

**Request Body:**
```json
{
  "status": "IN_PROGRESS"
}
```

---

### Job Photos

#### `POST /api/contractor/jobs/{job_id}/photos`
Upload photo to job.

**Auth:** Requires TECHNICIAN or ADMIN role

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file`: Image file
- `category`: Photo category (BEFORE, PROGRESS, AFTER, DETAIL, RECEIPT, DAMAGE, OTHER)
- `caption` (optional): Photo caption
- `notes` (optional): Additional notes

**Response:**
```json
{
  "id": "photo123",
  "job_id": "job123",
  "url": "https://storage.linode.com/...",
  "thumbnail_url": "https://storage.linode.com/.../thumb.jpg",
  "category": "PROGRESS",
  "caption": "Old faucet removed",
  "timestamp": "2025-11-15T09:45:00Z",
  "file_size": 2458624,
  "width": 3024,
  "height": 4032
}
```

#### `GET /api/contractor/jobs/{job_id}/photos`
Get all photos for a job.

**Query Params:**
- `category` (optional): Filter by photo category

**Response:**
```json
[
  {
    "id": "photo123",
    "url": "...",
    "category": "BEFORE",
    "caption": "...",
    "timestamp": "2025-11-15T09:15:00Z"
  }
]
```

#### `PUT /api/contractor/jobs/{job_id}/photos/{photo_id}`
Update photo caption/notes.

**Request Body:**
```json
{
  "caption": "Updated caption",
  "notes": "Additional notes"
}
```

#### `DELETE /api/contractor/jobs/{job_id}/photos/{photo_id}`
Delete a photo.

---

### Expenses

#### `GET /api/contractor/expenses`
Get all expenses for contractor.

**Query Params:**
- `job_id` (optional): Filter by specific job
- `start_date` (optional): YYYY-MM-DD
- `end_date` (optional): YYYY-MM-DD
- `category` (optional): Expense category

**Response:**
```json
[
  {
    "id": "exp123",
    "job_id": "job123",
    "category": "MATERIALS",
    "description": "Delta Faucet Model XYZ",
    "amount": 89.99,
    "date": "2025-11-14",
    "vendor": "Home Depot",
    "receipt_photos": ["https://..."],
    "notes": "Customer requested specific model"
  }
]
```

#### `POST /api/contractor/expenses`
Add new expense.

**Request Body:**
```json
{
  "job_id": "job123",
  "category": "MATERIALS",
  "description": "Plumbing supplies",
  "amount": 45.50,
  "date": "2025-11-14",
  "vendor": "Ace Hardware",
  "notes": "Optional notes"
}
```

#### `POST /api/contractor/expenses/{expense_id}/receipt`
Upload receipt photo to expense.

**Content-Type:** `multipart/form-data`

**Form Data:**
- `file`: Receipt image

#### `DELETE /api/contractor/expenses/{expense_id}`
Delete an expense.

---

### Mileage

#### `GET /api/contractor/mileage`
Get mileage logs.

**Query Params:**
- `start_date` (optional): YYYY-MM-DD
- `end_date` (optional): YYYY-MM-DD
- `job_id` (optional): Filter by specific job

**Response:**
```json
[
  {
    "id": "mile123",
    "job_id": "job123",
    "date": "2025-11-14",
    "start_location": {
      "address": "123 Home St, SF, CA",
      "latitude": 37.7749,
      "longitude": -122.4194
    },
    "end_location": {
      "address": "456 Oak St, SF, CA",
      "latitude": 37.7849,
      "longitude": -122.4094
    },
    "miles": 12.5,
    "purpose": "Kitchen faucet repair job",
    "auto_tracked": true,
    "created_at": "2025-11-14T09:00:00Z"
  }
]
```

#### `POST /api/contractor/mileage`
Add mileage log.

**Request Body:**
```json
{
  "job_id": "job123",
  "date": "2025-11-14",
  "start_location": {
    "address": "123 Home St, SF, CA",
    "latitude": 37.7749,
    "longitude": -122.4194
  },
  "end_location": {
    "address": "456 Oak St, SF, CA",
    "latitude": 37.7849,
    "longitude": -122.4094
  },
  "miles": 12.5,
  "purpose": "Job site visit",
  "notes": "Optional notes",
  "auto_tracked": false
}
```

#### `DELETE /api/contractor/mileage/{mileage_id}`
Delete mileage log.

---

### Time Tracking

#### `POST /api/contractor/jobs/{job_id}/time/start`
Start time tracking for a job.

**Request Body:**
```json
{
  "notes": "Starting faucet removal"
}
```

**Response:**
```json
{
  "id": "time123",
  "job_id": "job123",
  "start_time": "2025-11-15T09:00:00Z",
  "notes": "Starting faucet removal"
}
```

#### `POST /api/contractor/jobs/{job_id}/time/{time_log_id}/stop`
Stop time tracking.

**Request Body:**
```json
{
  "notes": "Completed installation",
  "break_time": 15  // minutes (optional)
}
```

**Response:**
```json
{
  "id": "time123",
  "job_id": "job123",
  "start_time": "2025-11-15T09:00:00Z",
  "end_time": "2025-11-15T11:00:00Z",
  "duration": 120,
  "break_time": 15,
  "notes": "Completed installation"
}
```

#### `GET /api/contractor/jobs/{job_id}/time`
Get all time logs for a job.

---

### Reports

#### `GET /api/contractor/reports/monthly`
Get monthly financial report.

**Query Params:**
- `year`: 2025
- `month`: 11 (1-12)

**Response:**
```json
{
  "period": "monthly",
  "year": 2025,
  "month": 11,
  "income": {
    "total_revenue": 8500.00,
    "job_count": 12,
    "average_job_value": 708.33
  },
  "expenses": {
    "total_expenses": 2100.00,
    "by_category": [
      {
        "category": "MATERIALS",
        "amount": 1500.00,
        "percentage": 71.43
      },
      {
        "category": "FUEL",
        "amount": 400.00,
        "percentage": 19.05
      }
    ]
  },
  "mileage": {
    "total_miles": 245.5,
    "deduction_rate": 0.70,
    "total_deduction": 171.85
  },
  "profit_loss": {
    "gross_income": 8500.00,
    "total_expenses": 2100.00,
    "mileage_deduction": 171.85,
    "net_profit": 6228.15
  }
}
```

#### `GET /api/contractor/reports/yearly`
Get yearly financial report (similar structure to monthly).

#### `GET /api/contractor/reports/tax`
Get tax report for custom date range.

**Query Params:**
- `start_date`: YYYY-MM-DD
- `end_date`: YYYY-MM-DD

#### `GET /api/contractor/reports/tax/pdf`
Export tax report as PDF.

**Query Params:**
- `start_date`: YYYY-MM-DD
- `end_date`: YYYY-MM-DD

**Response:** PDF file download

---

## Implementation Notes

### Photo Storage
- Use existing `LinodeObjectStorage` provider
- Generate thumbnails for gallery view (150x150 and 300x300)
- Store original full-resolution images
- Implement photo compression on upload (80% quality JPEG)

### Authentication & Authorization
- All contractor endpoints require `TECHNICIAN` or `ADMIN` role
- Use existing `require_technician_or_admin` dependency
- Ensure contractors can only access their own data
- Exception: ADMIN can access all contractor data

### Data Validation
- Validate photo categories against allowed enum
- Validate expense categories against allowed enum
- Ensure monetary amounts are positive
- Validate dates are in ISO format
- Validate coordinates for mileage logs

### Performance Considerations
- Index all queries for efficient lookups
- Implement pagination for job lists (50 per page)
- Cache dashboard stats for 5 minutes
- Lazy load photos (thumbnails first, full resolution on demand)

### Tax Deduction Calculations
- Store IRS standard mileage rate in configuration (update yearly)
- Current rate for 2025: $0.70/mile
- Calculate deductions server-side for accuracy
- Include mileage deduction in profit calculations

### Notifications (Future Enhancement)
- Notify contractor when new jobs become available
- Remind contractor to log expenses at end of day
- Alert when approaching tax deadline
- Notify customer when contractor shares photos

---

## Database Migration

If modifying existing `quotes` collection:

```javascript
// Add contractor-specific fields to existing quotes
db.quotes.updateMany(
  {},
  {
    $set: {
      contractor_notes: "",
      access_notes: "",
      scheduled_start_time: null,
      scheduled_end_time: null
    }
  }
);

// Create new collections
db.createCollection("job_photos");
db.createCollection("expenses");
db.createCollection("mileage_logs");
db.createCollection("time_logs");

// Create indexes
db.jobs.createIndex({ contractor_id: 1, status: 1 });
db.job_photos.createIndex({ job_id: 1, category: 1 });
db.expenses.createIndex({ contractor_id: 1, date: -1 });
db.mileage_logs.createIndex({ contractor_id: 1, date: -1 });
db.time_logs.createIndex({ job_id: 1, start_time: -1 });
```

---

## Testing Checklist

### Photo Management
- [ ] Upload photos with different categories
- [ ] Filter photos by category
- [ ] View photos in full-screen viewer
- [ ] Delete photos
- [ ] Add/update photo captions
- [ ] Handle large photo files (compression)

### Expense Tracking
- [ ] Add expenses with receipt photos
- [ ] View expenses by job
- [ ] View expenses by date range
- [ ] Filter expenses by category
- [ ] Delete expenses
- [ ] Calculate total expenses correctly

### Mileage Tracking
- [ ] Add manual mileage logs
- [ ] GPS auto-tracking (future)
- [ ] Calculate mileage deductions
- [ ] View mileage by date range
- [ ] Associate mileage with jobs

### Reports
- [ ] Generate monthly reports
- [ ] Generate yearly reports
- [ ] Calculate profit/loss correctly
- [ ] Include all expense categories
- [ ] Calculate mileage deductions
- [ ] Export to PDF

### Security
- [ ] Contractors can only access their own data
- [ ] Customers cannot access contractor endpoints
- [ ] Admins can access all data
- [ ] Photo uploads are authenticated
- [ ] File size limits enforced

---

## Future Enhancements

1. **Real-time GPS Tracking**: Auto-track mileage using GPS
2. **OCR for Receipts**: Extract amounts from receipt photos
3. **Photo Sharing with Customers**: Share progress photos directly
4. **Voice Notes**: Attach voice notes to jobs
5. **Calendar Integration**: Sync scheduled jobs to Google Calendar
6. **Automated Tax Forms**: Generate 1099 forms
7. **Expense Categories Auto-detection**: ML to categorize expenses
8. **Route Optimization**: Suggest optimal routes between jobs
9. **Photo Galleries**: Create shareable photo galleries per job
10. **Time Tracking with Breaks**: Detailed break tracking

---

## Summary

This contractor dashboard provides a comprehensive toolset for managing handyman businesses with emphasis on:
- Visual documentation through photos
- Accurate expense and mileage tracking for tax purposes
- Efficient job management workflow
- Professional reporting capabilities

All features are designed mobile-first for use in the field while working on jobs.

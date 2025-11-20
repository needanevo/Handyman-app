# The Real Johnson Handyman Services - Admin Guide

**Version**: 1.0
**Last Updated**: 2025-11-20
**Audience**: Non-technical administrators and business owners

---

## Table of Contents

1. [Introduction](#introduction)
2. [Getting Started - First Time Setup](#getting-started---first-time-setup)
3. [Connecting to Your Database](#connecting-to-your-database)
4. [Common Administrative Tasks](#common-administrative-tasks)
5. [Troubleshooting](#troubleshooting)
6. [Understanding Your Data](#understanding-your-data)

---

## Introduction

This guide will show you how to view and manage your handyman business data using **MongoDB Compass** - a free desktop application that lets you see customer information, contractor profiles, job requests, and quotes.

**What You'll Be Able to Do:**
- View all registered customers and contractors
- Check quote requests and their status
- Verify contractor registration information
- Search for specific users by email or phone
- Monitor job activity and quotes

**What You'll Need:**
- A Windows, Mac, or Linux computer
- Internet connection
- Your database connection information (provided below)

---

## Getting Started - First Time Setup

### Step 1: Download MongoDB Compass

1. **Open your web browser** (Chrome, Edge, Firefox, or Safari)

2. **Go to this website:**
   ```
   https://www.mongodb.com/try/download/compass
   ```

3. **The website will automatically detect your operating system:**
   - If you're on Windows, it will show "MongoDB Compass for Windows"
   - If you're on Mac, it will show "MongoDB Compass for macOS"
   - If you're on Linux, it will show "MongoDB Compass for Linux"

4. **Click the green "Download" button**
   - The file will download to your computer (usually to your "Downloads" folder)
   - The file will be named something like:
     - Windows: `mongodb-compass-1.40.4-win32-x64.exe`
     - Mac: `mongodb-compass-1.40.4-darwin-x64.dmg`

### Step 2: Install MongoDB Compass

**For Windows:**

1. **Find the downloaded file** in your Downloads folder
2. **Double-click the file** (the one ending in `.exe`)
3. **If Windows shows a security warning** ("Windows protected your PC"):
   - Click "More info"
   - Click "Run anyway"
4. **The installer will open**
5. **Click "Next"** on each screen
6. **Click "Install"** when prompted
7. **Wait for installation to complete** (takes 1-2 minutes)
8. **Click "Finish"**
9. **MongoDB Compass will open automatically**

**For Mac:**

1. **Find the downloaded file** in your Downloads folder
2. **Double-click the file** (the one ending in `.dmg`)
3. **A window will open showing the MongoDB Compass icon**
4. **Drag the MongoDB Compass icon to the Applications folder**
5. **Wait for the copy to complete**
6. **Open your Applications folder**
7. **Double-click "MongoDB Compass"**
8. **If Mac shows a security warning** ("MongoDB Compass cannot be opened"):
   - Click "OK"
   - Open "System Preferences"
   - Click "Security & Privacy"
   - Click "Open Anyway"
   - Click "Open" when asked to confirm

---

## Connecting to Your Database

### Step 1: Open MongoDB Compass

1. **Find MongoDB Compass on your computer:**
   - **Windows**: Start Menu → Search for "MongoDB Compass"
   - **Mac**: Applications folder → MongoDB Compass
   - **Or**: Look for the MongoDB Compass icon on your desktop

2. **Double-click to open it**
   - The application will open to a screen titled "New Connection"

### Step 2: Enter Your Connection Information

You'll see a large text box at the top of the window labeled "URI" or "Connection String"

1. **Click inside this text box**
   - It might already have some text in it (like `mongodb://localhost:27017`)
   - If so, select all the text (Ctrl+A on Windows, Cmd+A on Mac) and delete it

2. **Copy this connection string** (click the copy button on the right):
   ```
   mongodb+srv://needanevo:$1Jennifer@cluster0.d5iqsxn.mongodb.net/?appName=Cluster0&w=majority&tlsAllowInvalidCertificates=true
   ```

3. **Paste it into the text box:**
   - **Windows**: Right-click → Paste (or Ctrl+V)
   - **Mac**: Right-click → Paste (or Cmd+V)

4. **Verify the connection string is correct:**
   - It should start with `mongodb+srv://`
   - It should include `needanevo:$1Jennifer`
   - It should end with `&tlsAllowInvalidCertificates=true`

### Step 3: Connect to the Database

1. **Click the green "Connect" button** at the bottom of the screen
   - You'll see a loading spinner for 3-10 seconds

2. **Wait for the connection to complete**
   - If successful, you'll see a new screen with a list of databases on the left side

3. **You should see a database named `handyman_app`**
   - If you see this, congratulations! You're connected.

**If you don't see `handyman_app`:**
- Click the small refresh icon (circular arrow) at the top left
- If still not visible, see the [Troubleshooting](#troubleshooting) section below

### Step 4: Open Your Database

1. **Click on `handyman_app`** in the left sidebar
   - It will expand to show a list of "collections" (these are like folders for different types of data)

2. **You should see these collections:**
   - `users` - Customer and contractor accounts
   - `user_passwords` - Encrypted passwords (don't open this)
   - `quotes` - Quote requests from customers
   - `services` - Service categories (Drywall, Painting, etc.)
   - `jobs` - Active jobs and bookings
   - `photos` - Photo metadata and URLs
   - `events` - Activity log

---

## Common Administrative Tasks

### Task 1: View All Customers

**Purpose**: See a list of all registered customers

1. **Make sure you're connected** (see "Connecting to Your Database" above)
2. **Click on `handyman_app`** in the left sidebar (if not already open)
3. **Click on the `users` collection**
4. **You'll see a list of user accounts** with information like:
   - `_id` - Unique ID for each user
   - `email` - User's email address
   - `first_name` - User's first name
   - `last_name` - User's last name
   - `phone` - User's phone number
   - `role` - Either "CUSTOMER" or "TECHNICIAN" (contractor)

5. **To see only customers**, use a filter:
   - Find the "Filter" box at the top (it has a funnel icon)
   - Click inside the filter box
   - Type exactly: `{ "role": "CUSTOMER" }`
   - Press Enter
   - Now you'll see only customer accounts

6. **To clear the filter and see all users again:**
   - Click the small "X" next to the filter box

### Task 2: View All Contractors

**Purpose**: See all registered contractors and their information

1. **Click on the `users` collection** (in the left sidebar)
2. **In the Filter box** (at the top), type:
   ```
   { "role": "TECHNICIAN" }
   ```
3. **Press Enter**
4. **You'll see all contractor accounts**, including:
   - Contact information (name, email, phone)
   - `business_name` - Their business name
   - `skills` - Array of services they provide
   - `years_experience` - How many years of experience
   - `registration_status` - ACTIVE, EXPIRED, etc.
   - `registration_expiration_date` - When their registration expires

### Task 3: Find a Specific User by Email

**Purpose**: Look up a customer or contractor by their email address

1. **Click on the `users` collection**
2. **In the Filter box**, type (replace the email with the one you're searching for):
   ```
   { "email": "customer@example.com" }
   ```
3. **Press Enter**
4. **You'll see the user's complete profile** (if they exist)
5. **If you see "No documents"**, that email address is not registered

### Task 4: Find a User by Phone Number

**Purpose**: Look up someone by their phone number

1. **Click on the `users` collection**
2. **In the Filter box**, type (use the exact phone number format as stored):
   ```
   { "phone": "555-1234" }
   ```
3. **Press Enter**
4. **You'll see the user's profile** (if found)

**Note**: Phone numbers might be stored in different formats:
- Try: `"555-1234"`
- Try: `"5551234"`
- Try: `"+1-555-1234"`

### Task 5: View All Quote Requests

**Purpose**: See all customer quote requests and their status

1. **Click on the `quotes` collection** (in the left sidebar)
2. **You'll see a list of all quote requests**, including:
   - `customer_id` - Who requested the quote
   - `service_category` - What type of work (Drywall, Painting, etc.)
   - `description` - Customer's description of the work
   - `status` - DRAFT, SENT, VIEWED, ACCEPTED, REJECTED
   - `created_at` - When the quote was requested
   - `estimated_total` - Quote amount in dollars

3. **To see only pending quotes (waiting for response):**
   - In the Filter box, type: `{ "status": "SENT" }`
   - Press Enter

4. **To see only accepted quotes:**
   - In the Filter box, type: `{ "status": "ACCEPTED" }`
   - Press Enter

### Task 6: View Quotes for a Specific Customer

**Purpose**: See all quotes for one customer

1. **First, find the customer's ID:**
   - Go to the `users` collection
   - Search for the customer by email (see Task 3)
   - Copy their `_id` value (it looks like: `6733d4f2e9b8a1b2c3d4e5f6`)

2. **Go to the `quotes` collection**
3. **In the Filter box**, type (paste the customer's ID):
   ```
   { "customer_id": "6733d4f2e9b8a1b2c3d4e5f6" }
   ```
4. **Press Enter**
5. **You'll see all quotes for that customer**

### Task 7: Check Contractor Documents

**Purpose**: Verify a contractor uploaded their license, insurance, and portfolio

1. **Find the contractor in the `users` collection** (see Task 2)
2. **Scroll down in their user record to find:**
   - `license` - URL to their contractor license photo
   - `insurance` - URL to their insurance certificate
   - `business_licenses` - Array of business license URLs
   - `portfolio_photos` - Array of portfolio work photos

3. **To view a document:**
   - Click on the URL (it will be a long text starting with `https://photos.us-iad-10.linodeobjects.com/`)
   - Copy the URL
   - Paste it into your web browser's address bar
   - Press Enter
   - The photo/document will open in your browser

### Task 8: Export Data to Excel

**Purpose**: Create a spreadsheet of customers, contractors, or quotes

1. **Navigate to the collection you want to export** (users, quotes, etc.)
2. **Apply any filters if needed** (e.g., only customers, only active quotes)
3. **Click the "Export Data" button** at the top right
   - It looks like an arrow pointing out of a box
4. **Choose "Export Full Collection"** or "Export Query Results"
5. **Select "JSON" or "CSV" format**
   - **CSV** is best for opening in Excel
   - **JSON** is best for developers
6. **Click "Export"**
7. **Choose where to save the file** on your computer
8. **Open the file:**
   - **CSV**: Right-click → Open with → Microsoft Excel
   - **JSON**: Can be opened with a text editor or developer tools

---

## Understanding Your Data

### User Roles

Every user has a `role` field that determines what they can do:

- **CUSTOMER**: Regular homeowners who request quotes and book jobs
- **TECHNICIAN**: Contractors who provide services (also called "contractors")
- **ADMIN**: You (the business owner) - full access to everything

### Quote Statuses

Quotes go through several stages. The `status` field shows where each quote is:

- **DRAFT**: Customer started but hasn't submitted yet
- **SENT**: Quote sent to customer, waiting for their response
- **VIEWED**: Customer opened the quote email
- **ACCEPTED**: Customer accepted the quote (ready to schedule)
- **REJECTED**: Customer declined the quote
- **EXPIRED**: Quote was not accepted within the time limit

### Contractor Registration Status

Contractors must renew their registration annually. The `registration_status` field shows:

- **ACTIVE**: Contractor is current and can accept jobs
- **EXPIRING_SOON**: Registration expires in less than 30 days
- **EXPIRED**: Registration expired, cannot accept new jobs
- **GRACE_PERIOD**: Expired but has active jobs, must renew soon

### Important Date Fields

Dates are stored in ISO format (e.g., `2025-11-20T14:30:00.000Z`):

- The date is: `2025-11-20` (November 20, 2025)
- The time is: `14:30:00` (2:30 PM)
- The `Z` means UTC time (may differ from your local time zone)

To convert to your local time, add or subtract hours based on your timezone:
- **Eastern Time (EST)**: Subtract 5 hours (or 4 during daylight saving)
- **Central Time (CST)**: Subtract 6 hours (or 5 during daylight saving)
- **Pacific Time (PST)**: Subtract 8 hours (or 7 during daylight saving)

---

## Troubleshooting

### Problem: "Cannot connect to server"

**Possible Causes:**
1. **Internet connection issue**
   - Check if your internet is working (try opening a website)
   - Try disconnecting and reconnecting to WiFi

2. **Incorrect connection string**
   - Make sure you copied the entire connection string
   - Verify it starts with `mongodb+srv://`
   - Check for extra spaces at the beginning or end

3. **Database server is down**
   - Contact your developer or MongoDB Atlas support
   - Check MongoDB Atlas status page

**Solution:**
- Try the connection again in 1-2 minutes
- If still failing, close MongoDB Compass and reopen it
- Copy the connection string again (don't use the old one)

### Problem: "Authentication failed"

**Cause**: The username or password in the connection string is incorrect

**Solution:**
- Verify you're using the correct connection string (see "Step 2" under Connecting)
- The password is: `$1Jennifer` (must include the `$1` at the beginning)
- If the connection string was recently changed, get the new one from your developer

### Problem: "Cannot see handyman_app database"

**Possible Causes:**
1. Database name is different
2. Connection is to wrong cluster
3. Database hasn't been created yet

**Solution:**
- Click the refresh button (circular arrow icon) in MongoDB Compass
- Check if you see a different database name (like `test` or `admin`)
- Verify the connection string includes `cluster0.d5iqsxn.mongodb.net`
- Contact your developer if the database is truly missing

### Problem: "No documents found" in a collection

**Possible Causes:**
1. Filter is too restrictive
2. Collection is actually empty
3. Data hasn't synced yet

**Solution:**
- Clear all filters (click the "X" next to the filter box)
- Click the refresh button
- Wait 30 seconds and try again
- If still empty, data may not have been created yet

### Problem: Can't open photo/document URLs

**Possible Causes:**
1. URL was copied incorrectly
2. File was deleted from storage
3. URL expired

**Solution:**
- Make sure you copied the entire URL (starts with `https://` and ends with `.jpg` or `.pdf`)
- Try pasting the URL in a different browser
- Check if the file still exists in Linode Object Storage
- Contact your developer if URLs are consistently broken

---

## Need More Help?

**For Technical Issues:**
- Contact your developer
- Check the MongoDB Compass documentation: https://docs.mongodb.com/compass/

**For Business Questions:**
- Review customer quotes and contractor profiles using the tasks above
- Export data to Excel for deeper analysis
- Monitor registration expiration dates to remind contractors to renew

**For Database Changes:**
- **DO NOT** edit data directly unless you know what you're doing
- Changing user roles, quote statuses, or IDs can break the application
- Always make a backup (export) before making changes
- Consult with your developer before modifying any records

---

## Quick Reference - Connection String

**Save this connection string** for easy access:

```
mongodb+srv://needanevo:$1Jennifer@cluster0.d5iqsxn.mongodb.net/?appName=Cluster0&w=majority&tlsAllowInvalidCertificates=true
```

**Important Notes:**
- Keep this connection string private (it contains the database password)
- Don't share it with customers or contractors
- Store it in a secure password manager or encrypted document
- If you suspect the password has been compromised, contact your developer immediately to change it

---

**End of Admin Guide**

*Last updated: November 20, 2025*

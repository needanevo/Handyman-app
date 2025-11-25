# The Real Johnson - Static Web Frontend

This directory contains the complete static frontend for The Real Johnson platform.

## ✅ What's Included

### 1. Main Landing Page
- **File:** `index.html` + `styles.css`
- **10 Complete Sections:**
  1. Hero Section - "Build. Earn. Hire." with 3 CTA buttons
  2. How It Works - 3-step process for customers
  3. Handyman Empowerment - Orange section highlighting 85% earnings
  4. Contractor Professional - Clean professional section
  5. Job Request - Address form with "Start Job Request" button
  6. Features - 6 feature cards with icons
  7. Philosophy - Blue collar empowerment messaging
  8. App Download - iOS/Android buttons (Coming Soon badges)
  9. Testimonials - 3 testimonial cards with 5-star ratings
  10. Footer - Links to all legal pages and navigation

### 2. Customer Hire Flow (`/hire/`)
- **4-Step Job Request Process + Confirmation**
- **localStorage Persistence** - Data saved across all steps
- **Files:**
  - `index.html` - Step 1: Address/ZIP
  - `step2.html` - Step 2: Service category (12 categories)
  - `step3.html` - Step 3: Job details + photo URLs
  - `step4.html` - Step 4: Budget & timing
  - `confirmation.html` - Final summary
  - `style.css` - Complete styling
  - `script.js` - localStorage helpers

### 3. Handyman Marketing Page (`/handyman/`)
- **Complete Marketing Flow:**
  - Hero with 85% earnings emphasis
  - Simple requirements (18+, phone, bank, skills)
  - "Why Choose Us" - 6 benefit cards
  - Path to Growth - Handyman → LLC → Licensed Contractor
  - FAQ section (6 questions)
  - CTA with app download buttons
- **Files:** `index.html` + `style.css`

### 4. Contractor Marketing Page (`/contractor/`)
- **Professional Marketing Flow:**
  - Hero for licensed contractors
  - Requirements (license, insurance, business registration)
  - Benefits (6 benefit cards)
  - How It Works (5-step process)
  - FAQ section (7 questions)
  - CTA section
- **Files:** `index.html` + `style.css`

### 5. Legal Pages (`/legal/`)
- **Files:**
  - `terms.html` - Terms of Service
  - `privacy.html` - Privacy Policy
  - `contractor-agreement.html` - Independent Contractor Agreement

## 🎨 Design System

- **Primary Brand Color:** #FFA500 (Orange)
- **Typography:** System fonts (-apple-system, Segoe UI, Roboto)
- **Fully Responsive:** Mobile-first design with breakpoints at 768px and 480px
- **Consistent Buttons:** .btn-primary, .btn-secondary, .btn-outline classes

## 📱 Mobile Responsive

All pages are fully mobile-responsive with:
- Flexible grids using CSS Grid and Flexbox
- Mobile-optimized navigation
- Touch-friendly buttons and forms
- Readable typography at all screen sizes

## 🔗 Navigation Structure

```
/                           → Main landing page
├── /hire/                  → Customer job request flow
│   ├── index.html          → Step 1: Address
│   ├── step2.html          → Step 2: Category
│   ├── step3.html          → Step 3: Details
│   ├── step4.html          → Step 4: Budget
│   └── confirmation.html   → Confirmation summary
├── /handyman/              → Handyman marketing page
├── /contractor/            → Contractor marketing page
└── /legal/                 → Legal documents
    ├── terms.html          → Terms of Service
    ├── privacy.html        → Privacy Policy
    └── contractor-agreement.html → Contractor Agreement
```

## 🚀 Features

### localStorage Job Draft
The hire flow uses localStorage to persist data across steps:
```javascript
// Available functions (in hire/script.js)
loadDraft()         // Load existing draft
saveDraft(data)     // Save partial data
clearDraft()        // Clear all data
getDraftSummary()   // Get formatted summary
```

### Service Categories
12 categories available in Step 2:
- Plumbing
- Electrical
- Carpentry
- Drywall
- Painting
- HVAC
- Flooring
- Roofing
- Landscaping
- Appliance
- Windows & Doors
- Other

## 📝 Forms & Inputs

All forms include:
- Proper HTML5 validation
- Clear labels and placeholders
- Responsive layout
- Accessible design
- Focus states with orange accent

## 🔐 Legal Compliance

Complete legal framework included:
- Terms of Service (10 sections)
- Privacy Policy (GDPR-ready)
- Contractor Agreement (Independent contractor status)

## 🎯 Call-to-Action Flow

**For Customers:**
1. Land on homepage
2. Click "Hire a Pro" or fill address form
3. Complete 4-step job request
4. See confirmation with app download links

**For Handymen:**
1. Land on homepage
2. Click "Become a Handyman"
3. Learn about requirements and benefits
4. Click app download (Coming Soon)

**For Contractors:**
1. Land on homepage
2. Click "Become a Contractor"
3. Learn about professional requirements
4. Click app download (Coming Soon)

## 🌐 Browser Support

Tested and optimized for:
- Chrome/Edge (Chromium)
- Safari (iOS & macOS)
- Firefox
- Mobile browsers (iOS Safari, Chrome Mobile)

## ⚠️ Important Notes

1. **Static Frontend Only** - No backend integration required for these pages
2. **App Download Links** - Currently placeholder (#ios-placeholder, #android-placeholder)
3. **Photo Upload** - Hire flow accepts photo URLs; full upload requires mobile app
4. **No Framework Dependencies** - Pure HTML, CSS, and vanilla JavaScript
5. **No Build Process** - Ready to deploy as-is to any static hosting

## 🚀 Deployment

Simply upload the entire `web/` directory to any static hosting service:
- Netlify
- Vercel
- GitHub Pages
- AWS S3 + CloudFront
- Any web server (nginx, Apache)

No server-side processing required!

## 📧 Contact

For questions about this frontend implementation, refer to the main project documentation.

---

**Built with ❤️ for The Real Johnson**
*Fair pay. Direct relationships. Real work.*

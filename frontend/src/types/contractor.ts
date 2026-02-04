/**
 * Contractor-specific data models and types
 * These interfaces define the structure for jobs, expenses, mileage tracking, and photos
 */

// Job status workflow - MUST match backend JobStatus enum values
// Lifecycle: DRAFT -> POSTED -> ACCEPTED -> IN_PROGRESS -> IN_REVIEW -> COMPLETED -> PAID
export type JobStatus =
  | 'draft'         // Initial state
  | 'posted'        // Visible in feed, accepting proposals
  | 'accepted'      // Provider assigned, work scheduled
  | 'in_progress'   // Work has started
  | 'in_review'     // Work completed, awaiting review
  | 'completed'     // Reviewed and approved
  | 'paid'          // Payout processed

  // Cancellation states
  | 'cancelled_before_accept'
  | 'cancelled_after_accept'
  | 'cancelled_in_progress';

// Photo categories for job documentation
export type PhotoCategory =
  | 'BEFORE'         // Initial condition photos
  | 'PROGRESS'       // Work in progress
  | 'AFTER'          // Completed work
  | 'DETAIL'         // Close-up details
  | 'RECEIPT'        // Material receipts
  | 'DAMAGE'         // Pre-existing damage
  | 'OTHER';         // Miscellaneous

// Expense categories for tax reporting
export type ExpenseCategory =
  | 'MATERIALS'      // Building materials, supplies
  | 'TOOLS'          // Tool purchases
  | 'EQUIPMENT'      // Equipment rental
  | 'SUBCONTRACTOR'  // Subcontractor payments
  | 'FUEL'           // Vehicle fuel
  | 'PERMITS'        // Permits and fees
  | 'OTHER';         // Other expenses

export interface JobPhoto {
  id: string;
  jobId: string;
  url: string;
  thumbnailUrl?: string;
  category: PhotoCategory;
  caption?: string;
  notes?: string;
  timestamp: string;
  uploadedBy: string;
  fileSize?: number;
  width?: number;
  height?: number;
}

export interface Expense {
  id: string;
  jobId: string;
  category: ExpenseCategory;
  description: string;
  amount: number;
  receiptPhotos: string[];  // Array of photo URLs
  date: string;
  vendor?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MileageLog {
  id: string;
  jobId?: string;
  date: string;
  startLocation: {
    address: string;
    latitude: number;
    longitude: number;
  };
  endLocation: {
    address: string;
    latitude: number;
    longitude: number;
  };
  miles: number;
  purpose: string;
  notes?: string;
  autoTracked: boolean;  // GPS vs manual entry
  createdAt: string;
}

export interface JobTimelog {
  id: string;
  jobId: string;
  startTime: string;
  endTime?: string;
  duration?: number;  // in minutes
  notes?: string;
  breakTime?: number;  // in minutes
}

export interface CustomerInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  preferredContact?: 'email' | 'phone' | 'sms';
}

export interface JobLocation {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
  accessNotes?: string;  // Gate code, parking instructions, etc.
}

export interface Job {
  id: string;
  customerId: string;
  customer?: CustomerInfo;
  contractorId?: string;
  quoteId?: string;
  status: JobStatus | string;

  // Job details
  title: string;
  description: string;
  category: string;
  location: JobLocation;

  // Available jobs specific
  itemType?: 'quote' | 'job';  // Whether this is an open quote or accepted job
  distance?: number;  // Distance in miles from contractor

  // Scheduling
  requestedDate?: string;
  scheduledDate?: string;
  scheduledStartTime?: string;
  scheduledEndTime?: string;
  estimatedDuration?: number;  // in hours

  // Financial
  estimatedCost?: number;
  quotedAmount?: number;
  finalAmount?: number;
  depositAmount?: number;
  depositPaid: boolean;

  // Photos and documentation
  photos: JobPhoto[];
  customerPhotos: string[];  // Initial photos from customer

  // Expenses and time
  expenses: Expense[];
  timeLogs: JobTimelog[];
  totalExpenses: number;
  totalLaborHours: number;

  // Calculated fields
  profitMargin?: number;  // finalAmount - totalExpenses - (laborHours * hourlyRate)

  // Notes
  contractorNotes?: string;
  customerRequirements?: string;
  specialInstructions?: string;

  // Metadata
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  acceptedAt?: string;
}

// Summary statistics for dashboard
export interface DashboardStats {
  availableJobsCount: number;
  acceptedJobsCount: number;
  scheduledJobsCount: number;
  completedThisMonth: number;
  completedYearToDate: number;

  // Financial stats
  revenueThisMonth: number;
  revenueYearToDate: number;
  expensesThisMonth: number;
  expensesYearToDate: number;
  profitThisMonth: number;
  profitYearToDate: number;

  // Mileage stats
  milesThisMonth: number;
  milesYearToDate: number;
  milesAllTime: number;
}

// Tax report summary
export interface TaxReport {
  period: 'monthly' | 'quarterly' | 'yearly';
  startDate: string;
  endDate: string;

  income: {
    totalRevenue: number;
    jobCount: number;
    averageJobValue: number;
  };

  expenses: {
    totalExpenses: number;
    byCategory: {
      category: ExpenseCategory;
      amount: number;
      percentage: number;
    }[];
  };

  mileage: {
    totalMiles: number;
    deductionRate: number;  // Current IRS rate
    totalDeduction: number;
  };

  profitLoss: {
    grossIncome: number;
    totalExpenses: number;
    mileageDeduction: number;
    netProfit: number;
  };
}

// Filter and sort options
export interface JobFilters {
  status?: JobStatus[];
  dateRange?: {
    start: string;
    end: string;
  };
  category?: string[];
  searchQuery?: string;
  sortBy?: 'date' | 'amount' | 'customer' | 'status';
  sortOrder?: 'asc' | 'desc';
}

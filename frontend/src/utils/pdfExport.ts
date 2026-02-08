/**
 * Expense Export Utility
 *
 * Export expenses and vendor data as shareable HTML reports.
 * Uses expo-file-system + expo-sharing (works in Expo Go, no native build needed).
 */

import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

export interface ExpenseExportData {
  id: string;
  category: string;
  description: string;
  amount: number;
  vendor?: string;
  date: string;
  notes?: string;
}

export interface VendorSummary {
  vendorName: string;
  totalSpent: number;
  transactionCount: number;
  categories: string[];
}

/**
 * Generate HTML for expense report
 */
function generateExpenseHTML(
  expenses: ExpenseExportData[],
  title: string,
  dateRange?: { start: string; end: string }
): string {
  const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const categoryTotals = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);

  const vendorTotals = expenses.reduce((acc, exp) => {
    if (exp.vendor) {
      acc[exp.vendor] = (acc[exp.vendor] || 0) + exp.amount;
    }
    return acc;
  }, {} as Record<string, number>);

  const dateRangeText = dateRange
    ? `<p style="color: #666; font-size: 14px; margin-bottom: 20px;">
         ${new Date(dateRange.start).toLocaleDateString()} - ${new Date(dateRange.end).toLocaleDateString()}
       </p>`
    : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <title>${title}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          padding: 40px;
          color: #111827;
        }
        h1 {
          font-size: 28px;
          margin-bottom: 10px;
          color: #E88035;
        }
        h2 {
          font-size: 20px;
          margin-top: 30px;
          margin-bottom: 15px;
          color: #374151;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 30px;
        }
        th {
          background-color: #F3F4F6;
          padding: 12px;
          text-align: left;
          font-weight: 600;
          font-size: 12px;
          color: #374151;
          border-bottom: 2px solid #E5E7EB;
        }
        td {
          padding: 10px 12px;
          border-bottom: 1px solid #F3F4F6;
          font-size: 14px;
        }
        tr:hover {
          background-color: #F9FAFB;
        }
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 30px;
        }
        .summary-card {
          background-color: #FEF3ED;
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid #E88035;
        }
        .summary-label {
          font-size: 12px;
          color: #6B7280;
          margin-bottom: 8px;
        }
        .summary-value {
          font-size: 24px;
          font-weight: 700;
          color: #111827;
        }
        .amount {
          font-weight: 600;
          color: #FF776B;
        }
        .total-row {
          font-weight: 700;
          background-color: #F3F4F6;
        }
        .category-badge {
          display: inline-block;
          background-color: #E88035;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
        }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px solid #E5E7EB;
          text-align: center;
          color: #6B7280;
          font-size: 12px;
        }
        @media print {
          body {
            padding: 20px;
          }
        }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      ${dateRangeText}

      <div class="summary-grid">
        <div class="summary-card">
          <div class="summary-label">Total Expenses</div>
          <div class="summary-value">$${totalAmount.toFixed(2)}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">Total Transactions</div>
          <div class="summary-value">${expenses.length}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">Average Amount</div>
          <div class="summary-value">$${(totalAmount / expenses.length || 0).toFixed(2)}</div>
        </div>
      </div>

      <h2>Expense Details</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Category</th>
            <th>Description</th>
            <th>Vendor</th>
            <th style="text-align: right;">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${expenses
            .map(
              (expense) => `
            <tr>
              <td>${new Date(expense.date).toLocaleDateString()}</td>
              <td><span class="category-badge">${expense.category}</span></td>
              <td>${expense.description}</td>
              <td>${expense.vendor || '-'}</td>
              <td style="text-align: right;" class="amount">$${expense.amount.toFixed(2)}</td>
            </tr>
          `
            )
            .join('')}
          <tr class="total-row">
            <td colspan="4" style="text-align: right;">TOTAL:</td>
            <td style="text-align: right;" class="amount">$${totalAmount.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      <h2>Category Breakdown</h2>
      <table>
        <thead>
          <tr>
            <th>Category</th>
            <th style="text-align: right;">Total Amount</th>
            <th style="text-align: right;">Percentage</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(categoryTotals)
            .sort(([, a], [, b]) => b - a)
            .map(
              ([category, amount]) => `
            <tr>
              <td><span class="category-badge">${category}</span></td>
              <td style="text-align: right;" class="amount">$${amount.toFixed(2)}</td>
              <td style="text-align: right;">${((amount / totalAmount) * 100).toFixed(1)}%</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>

      ${
        Object.keys(vendorTotals).length > 0
          ? `
      <h2>Vendor Summary</h2>
      <table>
        <thead>
          <tr>
            <th>Vendor</th>
            <th style="text-align: right;">Total Spent</th>
            <th style="text-align: right;">Transactions</th>
          </tr>
        </thead>
        <tbody>
          ${Object.entries(vendorTotals)
            .sort(([, a], [, b]) => b - a)
            .map(
              ([vendor, amount]) => {
                const count = expenses.filter((e) => e.vendor === vendor).length;
                return `
              <tr>
                <td>${vendor}</td>
                <td style="text-align: right;" class="amount">$${amount.toFixed(2)}</td>
                <td style="text-align: right;">${count}</td>
              </tr>
            `;
              }
            )
            .join('')}
        </tbody>
      </table>
      `
          : ''
      }

      <div class="footer">
        <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
        <p style="margin-top: 8px;">The Real Johnson Handyman Services - Expense Report</p>
        <p style="margin-top: 4px; font-size: 10px;">For your records only. Not official tax documentation. Consult your tax professional.</p>
      </div>
    </body>
    </html>
  `;
}

/**
 * Export expenses as a shareable HTML report
 */
export async function exportExpensesToPDF(
  expenses: ExpenseExportData[],
  fileName: string = 'expenses',
  dateRange?: { start: string; end: string }
): Promise<void> {
  const title = dateRange
    ? `Expense Report - ${new Date(dateRange.start).toLocaleDateString()} to ${new Date(dateRange.end).toLocaleDateString()}`
    : 'Expense Report - All Time';

  const html = generateExpenseHTML(expenses, title, dateRange);
  const fileUri = `${FileSystem.cacheDirectory}${fileName}-${Date.now()}.html`;

  await FileSystem.writeAsStringAsync(fileUri, html, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  const isAvailable = await Sharing.isAvailableAsync();
  if (isAvailable) {
    await Sharing.shareAsync(fileUri, {
      mimeType: 'text/html',
      dialogTitle: 'Export Expense Report',
    });
  } else {
    throw new Error('Sharing is not available on this device');
  }
}

/**
 * Export vendor summary as a shareable HTML report
 */
export async function exportVendorSummaryToPDF(
  vendors: VendorSummary[],
  fileName: string = 'vendors'
): Promise<void> {
  const totalSpent = vendors.reduce((sum, v) => sum + v.totalSpent, 0);
  const totalTransactions = vendors.reduce((sum, v) => sum + v.transactionCount, 0);

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Vendor Summary Report</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          padding: 40px;
          color: #111827;
        }
        h1 { font-size: 28px; margin-bottom: 10px; color: #E88035; }
        h2 { font-size: 20px; margin-top: 30px; margin-bottom: 15px; color: #374151; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        th {
          background-color: #F3F4F6;
          padding: 12px;
          text-align: left;
          font-weight: 600;
          font-size: 12px;
          color: #374151;
          border-bottom: 2px solid #E5E7EB;
        }
        td {
          padding: 10px 12px;
          border-bottom: 1px solid #F3F4F6;
          font-size: 14px;
        }
        .summary-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          margin-bottom: 30px;
        }
        .summary-card {
          background-color: #FEF3ED;
          padding: 20px;
          border-radius: 8px;
          border-left: 4px solid #E88035;
        }
        .summary-label { font-size: 12px; color: #6B7280; margin-bottom: 8px; }
        .summary-value { font-size: 24px; font-weight: 700; color: #111827; }
        .amount { font-weight: 600; color: #FF776B; }
        .category-list { font-size: 12px; color: #6B7280; }
        .footer {
          margin-top: 40px;
          padding-top: 20px;
          border-top: 2px solid #E5E7EB;
          text-align: center;
          color: #6B7280;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <h1>Vendor Summary Report</h1>
      <p style="color: #666; font-size: 14px; margin-bottom: 20px;">
        Generated on ${new Date().toLocaleDateString()}
      </p>

      <div class="summary-grid">
        <div class="summary-card">
          <div class="summary-label">Total Spent</div>
          <div class="summary-value">$${totalSpent.toFixed(2)}</div>
        </div>
        <div class="summary-card">
          <div class="summary-label">Total Transactions</div>
          <div class="summary-value">${totalTransactions}</div>
        </div>
      </div>

      <h2>Vendor Details</h2>
      <table>
        <thead>
          <tr>
            <th>Vendor Name</th>
            <th style="text-align: right;">Total Spent</th>
            <th style="text-align: right;">Transactions</th>
            <th>Categories</th>
          </tr>
        </thead>
        <tbody>
          ${vendors
            .sort((a, b) => b.totalSpent - a.totalSpent)
            .map(
              (vendor) => `
            <tr>
              <td>${vendor.vendorName}</td>
              <td style="text-align: right;" class="amount">$${vendor.totalSpent.toFixed(2)}</td>
              <td style="text-align: right;">${vendor.transactionCount}</td>
              <td class="category-list">${vendor.categories.join(', ')}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>

      <div class="footer">
        <p>The Real Johnson Handyman Services - Vendor Summary</p>
        <p style="margin-top: 4px; font-size: 10px;">For your records only.</p>
      </div>
    </body>
    </html>
  `;

  const fileUri = `${FileSystem.cacheDirectory}${fileName}-${Date.now()}.html`;

  await FileSystem.writeAsStringAsync(fileUri, html, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  const isAvailable = await Sharing.isAvailableAsync();
  if (isAvailable) {
    await Sharing.shareAsync(fileUri, {
      mimeType: 'text/html',
      dialogTitle: 'Export Vendor Summary',
    });
  } else {
    throw new Error('Sharing is not available on this device');
  }
}

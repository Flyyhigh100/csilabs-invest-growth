import { User } from '@/hooks/admin/useAdminUsers';
import { formatTimestamp } from '../date';

/**
 * Converts user data to CSV format with separate wallet address columns
 */
export const generateUsersCsv = (users: User[]): string => {
  // Define CSV headers with separate wallet address columns
  const headers = [
    'First Name',
    'Last Name',
    'Email',
    'Polygon Address',
    'Solana Address',
    'KYC Status',
    'Registration Date',
    'User ID'
  ];
  
  // Format user data as CSV rows
  const rows = users.map(user => [
    escapeCsvField(user.first_name || ''),
    escapeCsvField(user.last_name || ''),
    escapeCsvField(user.email || ''),
    escapeCsvField(user.wallet_address || ''),
    escapeCsvField(user.solana_wallet_address || ''),
    escapeCsvField(user.kyc_status || 'Not started'),
    escapeCsvField(formatTimestamp(user.created_at)),
    escapeCsvField(user.id)
  ]);
  
  // Combine headers and rows
  return [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
};

/**
 * Download CSV file with user data
 */
export const downloadUsersCsv = (users: User[], includeTestData: boolean = false): void => {
  if (!users || users.length === 0) {
    console.error('No users to export');
    return;
  }
  
  // Generate CSV content
  const csvContent = generateUsersCsv(users);
  
  // Create a Blob containing the CSV data
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  // Create a link element to trigger the download
  const link = document.createElement('a');
  link.setAttribute('href', url);
  
  // Set filename with timestamp
  const timestamp = new Date().toISOString().split('T')[0];
  const testDataSuffix = includeTestData ? '-with-test-data' : '';
  link.setAttribute('download', `user-emails-${timestamp}${testDataSuffix}.csv`);
  
  // Append to the document, click to download, then remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Revoke the object URL to free up memory
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 100);
};

/**
 * Escape CSV field to handle commas, quotes, etc.
 */
const escapeCsvField = (value: any): string => {
  if (value === null || value === undefined) {
    return '';
  }
  
  const stringValue = String(value);
  
  // If the value contains a comma, newline, or double quote, wrap it in quotes
  if (stringValue.includes(',') || stringValue.includes('\n') || stringValue.includes('"')) {
    // Replace any double quotes with two double quotes
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  
  return stringValue;
};

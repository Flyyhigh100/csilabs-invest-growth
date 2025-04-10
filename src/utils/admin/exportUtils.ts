
import { PendingTransactionWithProfile } from "@/hooks/admin/usePendingTransactions";

/**
 * Creates and downloads a CSV file with pending token distribution data
 */
export const downloadPendingDistributionsCSV = (transactions: PendingTransactionWithProfile[]): void => {
  // Define CSV headers
  const headers = ['Date', 'User Name', 'Email', 'Amount', 'Wallet Address'];
  
  // Format transaction data for CSV
  const rows = transactions.map(tx => {
    const userName = tx.profiles ? 
      `${tx.profiles.first_name || ''} ${tx.profiles.last_name || ''}`.trim() : 
      'Unknown User';
      
    const email = tx.profiles?.email || '';
    const date = new Date(tx.created_at).toLocaleDateString();
    const amount = tx.amount.toFixed(2);
    
    return [date, userName, email, amount, tx.wallet_address];
  });
  
  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
  
  // Create a Blob containing the CSV data
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  // Create a link element to trigger the download
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `pending-distributions-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.display = 'none';
  
  // Append to the document, click it, and remove it
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Revoke the object URL to free up memory
  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 100);
};

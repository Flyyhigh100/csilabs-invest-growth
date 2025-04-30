
import { Transaction } from '@/types/transactions';
import { UserTransactionSummary } from './types';
import { toast } from 'sonner';

// Calculate summary metrics from transaction data
export const calculateSummary = (transactions: Transaction[]): UserTransactionSummary => {
  if (!transactions.length) {
    return {
      totalCount: 0,
      totalValue: 0,
      latestDate: null,
      successRate: 0,
      paymentMethods: [],
      statusBreakdown: []
    };
  }

  // Get latest transaction date
  const sortedByDate = [...transactions].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
  const latestDate = sortedByDate.length > 0 ? sortedByDate[0].created_at : null;

  // Calculate success rate
  const completedTransactions = transactions.filter(tx => tx.status === 'completed');
  const successRate = transactions.length > 0 
    ? (completedTransactions.length / transactions.length) * 100 
    : 0;

  // Group by payment method
  const methodCounts: Record<string, number> = {};
  transactions.forEach(tx => {
    const method = tx.payment_method || 'unknown';
    methodCounts[method] = (methodCounts[method] || 0) + 1;
  });

  // Group by status
  const statusCounts: Record<string, number> = {};
  transactions.forEach(tx => {
    const status = tx.status || 'unknown';
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });

  // Calculate total value
  const totalValue = transactions.reduce((sum, tx) => sum + Number(tx.amount || 0), 0);

  return {
    totalCount: transactions.length,
    totalValue,
    latestDate,
    successRate,
    paymentMethods: Object.entries(methodCounts).map(([method, count]) => ({ method, count })),
    statusBreakdown: Object.entries(statusCounts).map(([status, count]) => ({ status, count }))
  };
};

// Export transaction data as CSV
export const exportTransactionsToCSV = (transactions: Transaction[]) => {
  if (!transactions.length) {
    toast.error("No data to export");
    return;
  }

  try {
    // Format data for CSV
    const headers = [
      'Date', 
      'Transaction ID', 
      'Amount', 
      'Status', 
      'Payment Method', 
      'Wallet Address', 
      'Token Sent'
    ];

    const csvData = transactions.map(tx => [
      new Date(tx.created_at).toLocaleDateString(),
      tx.transaction_id,
      tx.amount,
      tx.status,
      tx.payment_method,
      tx.wallet_address,
      tx.token_sent ? 'Yes' : 'No'
    ]);

    // Convert to CSV format
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `transactions-export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("CSV exported successfully");
  } catch (err) {
    console.error("Error exporting to CSV:", err);
    toast.error("Failed to export data");
  }
};

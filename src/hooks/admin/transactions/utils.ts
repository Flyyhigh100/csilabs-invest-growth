
import { Transaction } from "@/types/transactions";
import { GroupedTransactions, UserTransactionSummary } from "./types";

/**
 * Calculates summary statistics from transaction data
 */
export const calculateSummary = (transactions: Transaction[]): UserTransactionSummary => {
  // Initialize summary object
  const summary: UserTransactionSummary = {
    totalCount: 0,
    totalValue: 0,
    completedCount: 0,
    completedValue: 0,
    pendingCount: 0,
    pendingValue: 0,
    failedCount: 0,
    testCount: 0,
    testValue: 0,
    largestTransaction: 0,
    largestCompletedTransaction: 0
  };
  
  // Process each transaction
  transactions.forEach(tx => {
    const amount = Number(tx.amount) || 0;
    const isCompleted = tx.status?.toLowerCase() === 'completed';
    const isFailed = tx.status?.toLowerCase() === 'failed';
    
    // Update largest transaction tracking
    if (amount > summary.largestTransaction) {
      summary.largestTransaction = amount;
    }
    
    if (tx.is_test) {
      // Test transaction
      summary.testCount++;
      summary.testValue += amount;
    } else {
      // Real transaction (non-test)
      summary.totalCount++;
      summary.totalValue += amount;
      
      if (isCompleted) {
        // Completed transaction
        summary.completedCount++;
        summary.completedValue += amount;
        
        // Track largest completed transaction
        if (amount > summary.largestCompletedTransaction) {
          summary.largestCompletedTransaction = amount;
        }
      } else if (isFailed) {
        // Failed transaction
        summary.failedCount++;
      } else {
        // Pending transaction (not completed, not failed)
        summary.pendingCount++;
        summary.pendingValue += amount;
      }
    }
  });
  
  return summary;
};

/**
 * Groups transactions by their status
 */
export const groupTransactionsByStatus = (transactions: Transaction[]): GroupedTransactions => {
  return transactions.reduce((groups, tx) => {
    if (tx.is_test) {
      groups.test.push(tx);
    } else if (tx.status?.toLowerCase() === 'completed') {
      groups.completed.push(tx);
    } else if (tx.status?.toLowerCase() === 'failed') {
      groups.failed.push(tx);
    } else {
      groups.pending.push(tx);
    }
    return groups;
  }, {
    completed: [],
    pending: [],
    failed: [],
    test: []
  } as GroupedTransactions);
};

/**
 * Exports transaction data to CSV format
 */
export const exportTransactionsToCSV = (transactions: Transaction[]) => {
  if (!transactions.length) return;
  
  // Define CSV columns
  const columns = [
    'Transaction ID',
    'Date',
    'Amount',
    'Status',
    'Payment Method',
    'Wallet Address',
    'Token Amount',
    'Token Price',
    'Is Test',
  ];
  
  // Convert transactions to CSV rows
  const rows = transactions.map(tx => [
    tx.transaction_id,
    new Date(tx.created_at).toISOString(),
    tx.amount,
    tx.status,
    tx.payment_method,
    tx.wallet_address,
    tx.token_amount || '',
    tx.token_price || '',
    tx.is_test ? 'Yes' : 'No',
  ]);
  
  // Combine header and rows
  const csvContent = [
    columns.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
  
  // Create and trigger download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.setAttribute('href', url);
  link.setAttribute('download', `transactions_export_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

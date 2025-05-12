
import { Transaction } from '@/types/transactions';
import { UserTransactionSummary } from './types';
import { formatCurrency } from '@/utils/format';

export const calculateSummary = (transactions: Transaction[]): UserTransactionSummary => {
  const totalCount = transactions.length;
  const totalValue = transactions.reduce((sum, tx) => sum + (Number(tx.amount) || 0), 0);
  const completedTransactions = transactions.filter(tx => tx.status === 'completed');
  const completedCount = completedTransactions.length;
  const pendingCount = transactions.filter(tx => tx.status === 'pending').length;
  
  const averageTransactionValue = totalCount > 0 
    ? totalValue / totalCount 
    : 0;
    
  const largestTransaction = transactions.reduce(
    (max, tx) => Math.max(max, Number(tx.amount) || 0), 
    0
  );
  
  // Group by payment method
  const paymentMethodMap = new Map<string, { count: number, value: number }>();
  transactions.forEach(tx => {
    const method = tx.payment_method || 'Unknown';
    const current = paymentMethodMap.get(method) || { count: 0, value: 0 };
    paymentMethodMap.set(method, {
      count: current.count + 1,
      value: current.value + (Number(tx.amount) || 0)
    });
  });
  
  // Group by status
  const statusMap = new Map<string, { count: number, value: number }>();
  transactions.forEach(tx => {
    const status = tx.status || 'Unknown';
    const current = statusMap.get(status) || { count: 0, value: 0 };
    statusMap.set(status, {
      count: current.count + 1,
      value: current.value + (Number(tx.amount) || 0)
    });
  });
  
  // Monthly trends (simplified - would be more complex with real data)
  const monthlyMap = new Map<string, { count: number, value: number }>();
  transactions.forEach(tx => {
    const date = new Date(tx.created_at);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    const monthName = date.toLocaleString('default', { month: 'short', year: 'numeric' });
    const current = monthlyMap.get(monthName) || { count: 0, value: 0 };
    monthlyMap.set(monthName, {
      count: current.count + 1,
      value: current.value + (Number(tx.amount) || 0)
    });
  });
  
  return {
    totalCount,
    totalValue,
    completedCount,
    pendingCount,
    averageTransactionValue,
    largestTransaction,
    paymentMethods: Array.from(paymentMethodMap.entries()).map(([method, data]) => ({
      method,
      count: data.count,
      value: data.value
    })),
    statusBreakdown: Array.from(statusMap.entries()).map(([status, data]) => ({
      status,
      count: data.count,
      value: data.value
    })),
    monthlyTrends: Array.from(monthlyMap.entries()).map(([month, data]) => ({
      month,
      count: data.count,
      value: data.value
    }))
  };
};

export const exportTransactionsToCSV = (transactions: Transaction[]): void => {
  if (!transactions || transactions.length === 0) {
    console.error('No transactions to export');
    return;
  }
  
  // Define CSV headers
  const headers = [
    'ID',
    'User ID',
    'Amount',
    'Status',
    'Payment Method',
    'Currency',
    'Token Amount',
    'Token Price',
    'Created At',
    'Completed At'
  ];
  
  // Format transaction data for CSV
  const csvData = transactions.map(tx => [
    tx.id,
    tx.user_id,
    tx.amount,
    tx.status,
    tx.payment_method,
    tx.currency || '',
    tx.token_amount || '',
    tx.token_price || '',
    tx.created_at,
    tx.completed_at || ''
  ]);
  
  // Combine headers and data
  const csvContent = [
    headers.join(','),
    ...csvData.map(row => row.join(','))
  ].join('\n');
  
  // Create a blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `transactions-${new Date().toISOString().slice(0, 10)}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};


import { useState } from 'react';
import { Transaction } from '@/types/transactions';
import { UserTransactionSummary, UseUserTransactionsProps } from './transactions/types';
import { calculateSummary, exportTransactionsToCSV } from './transactions/utils';
import { useTransactionQuery } from './transactions/useTransactionQuery';

// Main hook to handle user transactions with filters and processing
export const useUserTransactions = (props: UseUserTransactionsProps = {}) => {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  
  // Use the separated transaction query hook
  const {
    data: transactions = [],
    isLoading,
    error,
    refetch
  } = useTransactionQuery(props);

  // Calculate summary metrics from the transaction data
  const summary = calculateSummary(transactions);

  // Export function for CSV download
  const exportToCSV = () => {
    if (props.userId) {
      const filename = `user-transactions-${props.userId}.csv`;
      exportTransactionsToCSV(transactions);
    } else {
      exportTransactionsToCSV(transactions);
    }
  };

  return {
    transactions,
    isLoading,
    error,
    summary,
    refetch,
    selectedTransaction,
    setSelectedTransaction,
    exportToCSV
  };
};

export type { UserTransactionSummary, UseUserTransactionsProps };

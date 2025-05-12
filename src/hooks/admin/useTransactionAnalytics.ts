
import { useTransactionQuery } from './analytics/useTransactionQuery';
import { processTransactions } from './analytics/processTransactions';
import { TransactionAnalyticsProps, TransactionAnalyticsResult } from './analytics/types';
import { useTestDataToggle } from './useTestDataToggle';

/**
 * Hook for transaction analytics that combines data fetching and processing
 */
export const useTransactionAnalytics = (props: TransactionAnalyticsProps = {}): TransactionAnalyticsResult => {
  const { includeTestData } = useTestDataToggle();
  
  const { 
    data: transactions, 
    isLoading, 
    error, 
    refetch 
  } = useTransactionQuery(props);
  
  // Process transactions into analytics data
  const processedData = transactions ? processTransactions(transactions) : null;
  
  return {
    data: processedData,
    isLoading,
    error,
    refetch,
    includeTestData,
    rawTransactions: transactions // Expose raw transactions for debugging
  };
};

// Re-export types for external use
export type { TransactionAnalyticsProps } from './analytics/types';

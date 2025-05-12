
import { useTransactionQuery } from './analytics/useTransactionQuery';
import { processTransactions } from './analytics/processTransactions';
import { TransactionAnalyticsProps, TransactionAnalyticsResult } from './analytics/types';
import { useTestDataToggle } from './useTestDataToggle';
import { startOfMonth, subMonths } from 'date-fns';

/**
 * Hook for transaction analytics that combines data fetching and processing
 */
export const useTransactionAnalytics = (props: TransactionAnalyticsProps = {}): TransactionAnalyticsResult => {
  const { includeTestData } = useTestDataToggle();
  
  // If no date range is provided, default to start from March 2025 (project start)
  const defaultStartDate = props.startDate || startOfMonth(new Date(2025, 2, 1)); // March 1, 2025
  
  const adjustedProps = {
    ...props,
    startDate: defaultStartDate,
  };
  
  const { 
    data: transactions, 
    isLoading, 
    error, 
    refetch 
  } = useTransactionQuery(adjustedProps);
  
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

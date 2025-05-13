
import { Transaction } from '@/types/transactions';

// Input props for transaction analytics
export interface TransactionAnalyticsProps {
  startDate?: Date | null;
  endDate?: Date | null;
  status?: string;
  paymentMethod?: string;
  minAmount?: number;
  maxAmount?: number;
}

// Data structure for the transaction analytics results
export interface TransactionAnalyticsData {
  totalVolume: number;
  transactionCount: number;
  averageTransaction: number;
  preferredMethod: string;
  preferredMethodPercentage: number;
  bestDay: string;
  bestDayVolume: number;
  volumeOverTime: Array<{date: string; amount: number; count: number}>;
  paymentMethods: Array<{name: string; value: number}>;
  statusBreakdown: Array<{status: string; count: number}>;
}

// Result returned by the useTransactionAnalytics hook
export interface TransactionAnalyticsResult {
  data: TransactionAnalyticsData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  includeTestData: boolean;
  setIncludeTestData: (value: boolean) => void;
  rawTransactions: Transaction[] | null;
}

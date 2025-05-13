
import { Transaction } from '@/types/transactions';

/**
 * Props for transaction analytics
 */
export interface TransactionAnalyticsProps {
  startDate?: Date;
  endDate?: Date | null;
  status?: string;
  paymentMethod?: string;
  minAmount?: number;
  maxAmount?: number;
}

/**
 * Shape of processed analytics data
 */
export interface ProcessedAnalyticsData {
  totalVolume: number;
  averageTransaction: number;
  transactionCount: number;
  bestDay: string;
  bestDayVolume: number;
  preferredMethod: string;
  preferredMethodPercentage: number;
  paymentMethods: Array<{ name: string; value: number }>;
  statusBreakdown: Array<{ status: string; count: number }>;
  volumeOverTime: Array<{ date: string; amount: number }>;
}

/**
 * Result of using the transaction analytics hook
 */
export interface TransactionAnalyticsResult {
  data: ProcessedAnalyticsData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<any>;
  includeTestData: boolean;
  setIncludeTestData: (value: boolean) => void;
  rawTransactions: Transaction[] | null;
}

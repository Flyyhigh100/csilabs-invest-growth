
export interface TransactionAnalyticsProps {
  startDate?: Date | null;
  endDate?: Date | null;
  status?: string;
  paymentMethod?: string;
  minAmount?: number;
  maxAmount?: number;
}

export interface AnalyticsData {
  totalVolume: number;
  transactionCount: number;
  averageTransaction: number;
  volumeOverTime: Array<{
    date: string;
    amount: number;
    count: number;
  }>;
  paymentMethods: Array<{
    name: string;
    value: number;
    count: number;
  }>;
  statusBreakdown: Array<{
    status: string;
    count: number;
  }>;
  preferredMethod: string;
  preferredMethodPercentage: number;
  bestDay: string;
  bestDayVolume: number;
}

export interface TransactionAnalyticsResult {
  data: AnalyticsData | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  includeTestData: boolean;
  rawTransactions: any[] | null;
}


// Types for transaction related hooks

export interface UserTransactionSummary {
  totalCount: number;
  totalValue: number;
  completedCount: number;
  pendingCount: number;
  averageTransactionValue: number;
  largestTransaction: number;
  paymentMethods: Array<{
    method: string;
    count: number;
    value: number;
  }>;
  statusBreakdown: Array<{
    status: string;
    count: number;
    value: number;
  }>;
  monthlyTrends: Array<{
    month: string;
    count: number;
    value: number;
  }>;
}

export interface UseUserTransactionsProps {
  userId?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
  minAmount?: number;
  maxAmount?: number;
  paymentMethod?: string;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

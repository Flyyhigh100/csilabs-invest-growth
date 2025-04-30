
// Types for the transaction hooks
export interface UserTransactionSummary {
  totalCount: number;
  totalValue: number;
  latestDate: string | null;
  successRate: number;
  paymentMethods: {
    method: string;
    count: number;
  }[];
  statusBreakdown: {
    status: string;
    count: number;
  }[];
}

export interface UseUserTransactionsProps {
  userId?: string;
  dateRange?: { from: Date; to: Date };
  status?: string;
  paymentMethod?: string;
  minAmount?: number;
  maxAmount?: number;
  searchQuery?: string;
}

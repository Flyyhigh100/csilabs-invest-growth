
import { Transaction } from "@/types/transactions";

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

export interface UserTransactionSummary {
  // Total stats (all non-test transactions)
  totalCount: number;
  totalValue: number;
  
  // Completed stats (non-test, status=completed)
  completedCount: number;
  completedValue: number;
  
  // Pending stats (non-test, status!=completed)
  pendingCount: number;
  pendingValue: number;
  
  // Failed stats
  failedCount: number;
  
  // Test stats (all is_test=true)
  testCount: number;
  testValue: number;
  
  // Largest transactions
  largestTransaction: number;
  largestCompletedTransaction: number;
  
  // Charts data
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
}

export interface GroupedTransactions {
  completed: Transaction[];
  pending: Transaction[];
  failed: Transaction[];
  test: Transaction[];
}

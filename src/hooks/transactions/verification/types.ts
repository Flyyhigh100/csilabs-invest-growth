
import { Transaction } from '@/types/transactions';

export interface VerificationOptions {
  sessionId: string | null;
  success: string | null;
  userId: string | undefined;
  refreshSession: () => Promise<void>;
}

export interface VerificationState {
  transaction: Transaction | null;
  isRefreshing: boolean;
  hasCheckedStatus: boolean;
  pollingCount: number;
}

export interface VerificationResult {
  transaction: Transaction | null;
  isRefreshing: boolean;
  hasCheckedStatus: boolean;
  handleRefresh: () => Promise<void>;
}

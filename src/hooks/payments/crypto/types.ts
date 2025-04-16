
import { Transaction } from '@/types/transactions';

export interface CryptoStatusCheckResult {
  error?: string;
  status: string;
  updated: boolean;
  transaction_not_found?: boolean;
  api_key_issue?: boolean;
  network_issue?: boolean;
  details?: string;
  transaction?: Transaction;
  external_status?: number;
  external_status_text?: string;
  message?: string;
  newStatus?: string;
  previousStatus?: string;
}

export interface StatusCheckOptions {
  forceUpdate?: boolean;
}

export interface TransactionUpdateResult {
  transaction: Transaction;
  updated: boolean;
  status: string;
  message: string;
}

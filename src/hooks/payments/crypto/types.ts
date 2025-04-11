
import { Transaction } from '@/types/transactions';

export interface CryptoStatusCheckResult {
  error?: string;
  status: string;
  updated: boolean;
  transaction?: Transaction;
  external_status?: number;
  external_status_text?: string;
  message?: string;
  transaction_not_found?: boolean;
  api_key_issue?: boolean;
  network_issue?: boolean;
  details?: string;
}

export interface CryptoPaymentDetails {
  paymentAddress: string;
  transactionId: string;
  instructions: string;
  qrCodeUrl?: string;
  statusUrl?: string;
  expiresAt?: string;
  externalTransactionId?: string;
  currency: string;
  checkStatusUrl?: string;
}

export interface TransactionSyncResult {
  success: boolean;
  message: string;
  transaction?: Transaction;
  updated?: boolean;
}

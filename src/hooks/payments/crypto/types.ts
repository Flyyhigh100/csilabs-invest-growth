
import { Transaction } from '@/types/transactions';

export interface CryptoStatusCheckResult {
  // Success properties
  transaction?: Transaction;
  updated?: boolean;
  status: string;
  external_status?: number;
  external_status_text?: string;
  message?: string;
  
  // Error properties
  error?: string;
  api_key_issue?: boolean;
  network_issue?: boolean;
  transaction_not_found?: boolean;
  details?: string;
}

export interface CryptoPaymentInfo {
  address: string;
  amount: number;
  amountf: string;
  confirms_needed: number;
  timeout: number;
  checkout_url: string;
  status_url: string;
  qrcode_url: string;
}

export interface CreateCryptoPaymentResult {
  success: boolean;
  payment_info?: CryptoPaymentInfo;
  error?: string;
  transaction_id?: string;
  external_id?: string;
}

export interface CoinPaymentsCreateParams {
  amount: number;
  walletAddress: string;
  currency: string;
  cryptoAmount?: number;
}

export interface CryptoPaymentCreateParams {
  amount: number;
  walletAddress: string;
}

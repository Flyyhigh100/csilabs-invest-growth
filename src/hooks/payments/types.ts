
import { KycVerificationData } from '../kyc/types';
import { Transaction } from '@/types/transactions';

export interface CryptoPaymentDetails {
  transactionId?: string;
  address?: string;
  amount?: number | string;
  checkout_url?: string;
  payment_id?: string;
  payment_address?: string;
  payment_amount?: number;
  payment_qr_code?: string;
  timeout?: number;
  txn_id?: string;
  status_url?: string;
  status_text?: string;
  currency?: string;
  currency_name?: string;
  currency_iso?: string;
  tokenPrice?: number;
  token_amount?: number;
  confirmations_needed?: number;
  [key: string]: any;
}

export interface StripeCryptoOnrampResult {
  success: boolean;
  redirect_url?: string;
  session_id?: string;
  client_secret?: string;
  error?: string;
  details?: string;
  client_side?: boolean;
}

export interface UsePaymentHandlersProps {
  walletAddress: string | null;
}

export interface UsePaymentHandlersReturn {
  isProcessing: boolean;
  showCryptoDialog: boolean;
  setShowCryptoDialog: (show: boolean) => void;
  cryptoPaymentDetails: CryptoPaymentDetails | null;
  handleStripeCryptoOnramp: (amount: number, currentTokenPrice?: number) => Promise<StripeCryptoOnrampResult>;
  handleCoinPaymentsPayment: (amount: number, currency?: string, currentTokenPrice?: number) => Promise<boolean>;
  handleCryptoPayment: (amount: number, currentTokenPrice?: number) => Promise<boolean>;
  kycRequired: (amount: number) => boolean;
}

export interface PaymentValidationResult {
  isValid: boolean;
  error?: string;
}

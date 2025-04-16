
import { Transaction } from '@/types/transactions';

export interface CryptoPaymentDetails {
  paymentAddress: string;
  transactionId: string;
  instructions: string;
  qrCodeUrl?: string;
  statusUrl?: string;
  expiresAt?: string;
  checkStatusUrl?: string;
  externalTransactionId?: string;
  currency: string;
  amount?: string;    // Add amount field for cryptocurrency amount
  usdValue?: number;  // Add USD value for reference
}

export interface UsePaymentHandlersProps {
  amount: number;
}

export interface UsePaymentHandlersReturn {
  isProcessing: boolean;
  showCryptoDialog: boolean;
  cryptoPaymentDetails: CryptoPaymentDetails | null;
  handleStripePayment: (amount: number) => Promise<boolean>;
  handleCoinPaymentsPayment: (amount: number, currency?: string) => Promise<boolean>;
  handleCryptoPayment: (amount: number) => Promise<boolean>;
  setShowCryptoDialog: (show: boolean) => void;
  kycRequired: (amount: number) => boolean;
}

export interface CryptoStatusCheckResult {
  status: string;
  external_status: string | null;
  external_status_text: string | null;
  updated: boolean;
  transaction?: Transaction;
  error?: string;
  details?: string;
}

// Add the missing PaymentValidationOptions interface
export interface PaymentValidationOptions {
  isCrypto?: boolean;
}


import { Transaction } from '@/types/transactions';

export interface CryptoPaymentDetails {
  paymentAddress: string;
  transactionId: string;
  instructions: string;
  qrCodeUrl?: string;
  statusUrl?: string;
  expiresAt?: string;
  externalTransactionId?: string;
  currency?: string;
  checkStatusUrl?: string;
  cryptoAmount?: number; // Add crypto amount field
}

export interface UsePaymentHandlersReturn {
  isProcessing: boolean;
  showCryptoDialog: boolean;
  setShowCryptoDialog: (show: boolean) => void;
  cryptoPaymentDetails: CryptoPaymentDetails;
  handleStripePayment: (amount: number) => Promise<boolean>;
  handleCoinPaymentsPayment: (amount: number, currency?: string) => Promise<boolean>;
  handleCryptoPayment: (amount: number) => Promise<boolean>;
  kycRequired: (amount: number) => boolean;
}

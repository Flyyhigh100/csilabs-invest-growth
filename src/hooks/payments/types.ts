
// Types for payment handlers

export type CryptoPaymentDetails = {
  paymentAddress: string;
  transactionId: string;
  instructions: string;
  qrCodeUrl?: string;
  statusUrl?: string;
  expiresAt?: string;
  externalTransactionId?: string;
  currency?: string;
  checkStatusUrl?: string;
} | null;

export interface PaymentValidationOptions {
  isCrypto?: boolean;
}

export interface UsePaymentHandlersProps {
  walletAddress: string | null;
}

export interface UsePaymentHandlersReturn {
  isProcessing: boolean;
  showCryptoDialog: boolean;
  setShowCryptoDialog: (show: boolean) => void;
  cryptoPaymentDetails: CryptoPaymentDetails;
  handleStripePayment: (amount: number) => Promise<void>;
  handleCoinPaymentsPayment: (amount: number, currency?: string) => Promise<void>;
  handleCryptoPayment: (amount: number) => Promise<void>;
  kycRequired: (amount: number) => boolean;
}

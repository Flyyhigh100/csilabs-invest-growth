
// Payment related types
export interface PaymentValidationOptions {
  isCrypto: boolean;
}

export interface CryptoPaymentDetails {
  paymentAddress: string;
  transactionId: string;
  instructions?: string;
  qrCodeUrl?: string;
  statusUrl?: string;
  expiresAt?: string;
  externalTransactionId?: string;
  currency: string;
  checkStatusUrl?: string;
  usdValue?: number;
  tokenAmount?: number;
  tokenPrice?: number;
  amount?: string; // Add missing amount property
}

export interface UsePaymentHandlersProps {
  walletAddress: string | null;
}

export interface UsePaymentHandlersReturn {
  isProcessing: boolean;
  showCryptoDialog: boolean;
  setShowCryptoDialog: (show: boolean) => void;
  cryptoPaymentDetails: CryptoPaymentDetails | null;
  handleStripePayment: (amount: number, currentTokenPrice?: number) => Promise<boolean>;
  handleCoinPaymentsPayment: (amount: number, currency: string, currentTokenPrice?: number) => Promise<boolean>;
  handleCryptoPayment: (amount: number, currentTokenPrice?: number) => Promise<boolean>;
  kycRequired: (amount: number) => boolean;
}

export interface CryptoStatusCheckResult {
  status: string;
  updated: boolean;
  transaction?: any;
  error?: string;
}

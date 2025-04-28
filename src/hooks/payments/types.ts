
export interface CryptoPaymentDetails {
  paymentAddress: string;
  transactionId: string;
  instructions?: string;
  qrCodeUrl?: string;
  statusUrl?: string;
  expiresAt?: string;
  externalTransactionId?: string;
  currency?: string;
  amount?: string;  // Add this to store the actual crypto amount
  checkStatusUrl?: string;
  usdValue?: number;  // USD value for reference
  tokenAmount?: number;  // Store token amount for reference
  tokenPrice?: number;   // Store token price for reference
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
  kycRequired: (amount: number) => boolean; // Updated to be a function type
}

export interface CryptoStatusCheckResult {
  status: string;
  updated: boolean;
  transaction?: any;
  error?: string;
}

export interface PaymentValidationOptions {
  isCrypto?: boolean;
  skipKycCheck?: boolean;
  tokenPrice?: number; // Added the missing tokenPrice property
}

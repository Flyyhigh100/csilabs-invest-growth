
export interface CryptoPaymentDetails {
  transactionId: string;
  paymentAddress: string;
  qrCodeUrl?: string;
  statusUrl?: string;
  externalTransactionId?: string;
  currency: string;
  amount: string | number;
  usdValue: number;
  checkStatusUrl?: string;
  expiresAt?: string;
  instructions?: string;
  tokenAmount?: number;
  tokenPrice?: number;
}

export interface UsePaymentHandlersProps {
  walletAddress: string | null;
}

export interface UsePaymentHandlersReturn {
  isProcessing: boolean;
  showCryptoDialog: boolean;
  setShowCryptoDialog: (show: boolean) => void;
  cryptoPaymentDetails: CryptoPaymentDetails | null;
  handleStripeCryptoOnramp: (amount: number, currentTokenPrice?: number) => Promise<boolean>;
  handleCoinPaymentsPayment: (amount: number, currency?: string, currentTokenPrice?: number) => Promise<boolean>;
  handleCryptoPayment: (amount: number, currentTokenPrice?: number) => Promise<boolean>;
  kycRequired: (amount: number) => boolean;
}

// Add the missing PaymentValidationOptions interface
export interface PaymentValidationOptions {
  isCrypto?: boolean;
  skipKycCheck?: boolean;
  tokenPrice?: number;
}

// Add the new Stripe Crypto Onramp types
export interface StripeCryptoOnrampResult {
  success: boolean;
  clientSecret?: string;
  sessionId?: string;
  error?: string;
}

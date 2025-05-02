
// Transaction types
export interface CryptoPaymentDetails {
  address?: string;
  amount?: string;
  checkout_url?: string;
  confirms_needed?: number;
  currency?: string;
  currency2?: string;
  payment_id?: string;
  qrcode_url?: string;
  status_url?: string;
  timeout?: number;
  txn_id?: string;
  // Added fields for debugging
  raw_data?: any;
  payment_address?: string;
}

export interface StripeCryptoOnrampResult {
  success: boolean;
  clientSecret?: string;
  redirect_url?: string; // Added for the redirect flow
  sessionId?: string;
  error?: string;
}

// Hook interfaces
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

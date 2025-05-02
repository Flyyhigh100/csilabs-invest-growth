
// Define types for payment hooks

export interface CryptoPaymentDetails {
  address: string;
  amount: number;
  amountInCrypto?: number;
  currency?: string;
  qrCodeUrl?: string;
  status?: string;
  txnId?: string;
}

export interface StripeCryptoOnrampResult {
  success: boolean;
  error?: string;
  details?: string;
  redirect_url?: string;
  sessionId?: string;
  clientSecret?: string;
}

export interface UsePaymentHandlersProps {
  walletAddress: string | null;
}

export interface UsePaymentHandlersReturn {
  isProcessing: boolean;
  showCryptoDialog: boolean;
  setShowCryptoDialog: React.Dispatch<React.SetStateAction<boolean>>;
  cryptoPaymentDetails: CryptoPaymentDetails | null;
  handleStripeCryptoOnramp: (amount: number, currentTokenPrice?: number) => Promise<StripeCryptoOnrampResult>;
  handleCoinPaymentsPayment: (amount: number, currency?: string, currentTokenPrice?: number) => Promise<boolean>;
  handleCryptoPayment: (amount: number, currentTokenPrice?: number) => Promise<boolean>;
  kycRequired: (amount: number) => boolean;
}

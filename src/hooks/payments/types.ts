
// Define types for payment hooks

export interface CryptoPaymentDetails {
  address: string;
  amount: number;
  amountInCrypto?: number;
  currency?: string;
  qrCodeUrl?: string;
  status?: string;
  txnId?: string;
  
  // Legacy properties
  payment_address?: string;
  paymentAddress?: string;
  qrcode_url?: string;
  statusUrl?: string;
  status_url?: string;
  transactionId?: string;
  payment_id?: string;
  externalTransactionId?: string;
  txn_id?: string;
  expiresAt?: string;
  instructions?: string;
  usdValue?: number;
  checkStatusUrl?: string;
  tokenAmount?: number;
  tokenPrice?: number;
}

export interface StripeCryptoOnrampResult {
  success: boolean;
  error?: string;
  details?: string;
  redirect_url?: string;
  session_id?: string;
  client_secret?: string;
  suggestion?: string;
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

// Define the PaymentValidationOptions interface
export interface PaymentValidationOptions {
  isCrypto?: boolean;
  skipKycCheck?: boolean;
  tokenPrice?: number;
}

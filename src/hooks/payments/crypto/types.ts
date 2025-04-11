
export interface CryptoPaymentDetails {
  paymentAddress?: string;
  transactionId?: string;
  instructions?: string;
  qrCodeUrl?: string;
  statusUrl?: string;
  expiresAt?: string;
  externalTransactionId?: string;
  currency?: string;
  checkStatusUrl?: string;
}

export interface CryptoStatusCheckResult {
  error?: string;
  status: string;
  updated: boolean;
  external_status?: number;
  external_status_text?: string;
  transaction?: any;
  api_key_issue?: boolean;
  network_issue?: boolean;
}

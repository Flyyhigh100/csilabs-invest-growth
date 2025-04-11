
export interface CryptoStatusCheckResult {
  status: string;
  updated: boolean;
  external_status?: number;
  external_status_text?: string;
  message?: string;
  error?: string;
}

export interface TransactionStatusOptions {
  forceUpdate?: boolean;
}

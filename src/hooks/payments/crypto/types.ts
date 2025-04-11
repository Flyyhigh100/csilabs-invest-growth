
export interface CryptoStatusCheckResult {
  error?: string;
  status: string;
  updated: boolean;
  transaction?: any;
  payment_status?: any;
  external_status?: number;
  external_status_text?: string;
  message?: string;
  transaction_not_found?: boolean;
  api_key_issue?: boolean;
  network_issue?: boolean;
}

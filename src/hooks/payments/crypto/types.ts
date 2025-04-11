
export interface CryptoStatusCheckResult {
  status: string;
  updated: boolean;
  error?: string;
  external_status?: number;
  external_status_text?: string;
  api_key_issue?: boolean;
  network_issue?: boolean;
}

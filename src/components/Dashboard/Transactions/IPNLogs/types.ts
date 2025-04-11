
export interface IPNLog {
  id: string;
  provider: string;
  txn_id: string | null;
  status: string | null;
  raw_data: any;
  is_valid: boolean;
  response_status: string | null;
  created_at: string;
  verification_status?: string;
  hmac_header?: string;
  request_body?: string;
}

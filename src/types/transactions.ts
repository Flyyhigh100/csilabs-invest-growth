
export interface Transaction {
  id: string;
  amount: number;
  wallet_address: string;
  status: string;
  payment_method: string;
  created_at: string;
  updated_at: string;
  transaction_id: string;
  token_sent: boolean;
  token_amount?: number;
  token_price?: number;
  blockchain_tx_id?: string;
  external_transaction_id?: string;
  user_id: string;
  approval_status?: string;
  admin_notes?: string;
  payment_address?: string;
  kyc_verification_id?: string;
  high_value_approval_required?: boolean;
  is_test?: boolean;
}

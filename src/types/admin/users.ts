
export type User = {
  id: string;
  email: string;
  role: string;
  status: string;
  rejection_reason?: string;
  created_at?: string;
  first_name?: string;
  last_name?: string;
  updated_at?: string;
  wallet_address?: string;
  [key: string]: any;
};

export type KycVerification = {
  id: string;
  user_id: string;
  status: string;
  [key: string]: any;
};


import { Database } from '@/integrations/supabase/types';

// Modified to be a string type rather than using the enum directly
// This allows us to handle cases where the backend may return statuses not in the enum
export type KycStatus = string;

export interface KycVerificationData {
  id: string;
  user_id: string;
  status: KycStatus;
  first_name: string | null;
  last_name: string | null;
  date_of_birth: string | null;
  nationality: string | null;
  address: string | null;
  city: string | null;
  postal_code: string | null;
  country: string | null;
  id_front_url: string | null;
  id_back_url: string | null;
  selfie_url: string | null;
  rejection_reason: string | null;
  clarification_message: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface KycFormData {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  nationality: string;
  address: string;
  city: string;
  postal_code: string;
  country: string;
}

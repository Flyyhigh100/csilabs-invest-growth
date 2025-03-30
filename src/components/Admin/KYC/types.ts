
import { KycVerificationData } from '@/hooks/kyc';
import { Database } from '@/integrations/supabase/types';

export type KycStatus = string; // Use string to handle all possible statuses including 'needs_clarification'

// Enhanced KYC type that includes profile data
export interface KycVerificationWithProfile extends KycVerificationData {
  profile_first_name?: string | null;
  profile_last_name?: string | null;
}

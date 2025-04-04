
import { KycVerificationData } from '@/hooks/kyc';
import { Database } from '@/integrations/supabase/types';

// Updated KYC status type to explicitly include 'needs_clarification' and 'not_started'
export type KycStatus = 'not_started' | 'pending' | 'approved' | 'rejected' | 'needs_clarification';

// Enhanced KYC type that includes profile data
export interface KycVerificationWithProfile extends KycVerificationData {
  profile_first_name?: string | null;
  profile_last_name?: string | null;
}

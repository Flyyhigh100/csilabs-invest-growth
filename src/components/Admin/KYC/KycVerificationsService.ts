
import { supabase } from '@/integrations/supabase/client';
import { KycVerificationWithProfile } from './types';

// Fetch KYC verifications function
export const fetchKycVerifications = async (): Promise<KycVerificationWithProfile[]> => {
  console.log('Fetching KYC verifications from database');
  
  // First, get all KYC verifications
  const { data: kycData, error: kycError } = await supabase
    .from('kyc_verifications')
    .select('*')
    .order('submitted_at', { ascending: false });
  
  if (kycError) {
    console.error('Error fetching KYC verifications:', kycError);
    throw kycError;
  }
  
  console.log('Raw KYC data fetched:', kycData);
  
  // Then, for each KYC verification, fetch the associated profile data
  const enhancedKycData: KycVerificationWithProfile[] = await Promise.all(
    (kycData || []).map(async (kyc) => {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', kyc.user_id)
        .maybeSingle();
      
      if (profileError) {
        console.error(`Error fetching profile for user ${kyc.user_id}:`, profileError);
      }
      
      return {
        ...kyc,
        profile_first_name: profileData?.first_name || null,
        profile_last_name: profileData?.last_name || null
      };
    })
  );
  
  console.log('KYC verifications fetched with profiles:', enhancedKycData.length || 0);
  return enhancedKycData;
};

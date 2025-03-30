
import { supabase } from '@/integrations/supabase/client';
import { KycVerificationWithProfile } from './types';

// Fetch KYC verifications function
export const fetchKycVerifications = async (): Promise<KycVerificationWithProfile[]> => {
  console.log('Fetching KYC verifications from database');
  
  try {
    // First, get all KYC verifications
    const { data: kycData, error: kycError, count } = await supabase
      .from('kyc_verifications')
      .select('*', { count: 'exact' })
      .order('submitted_at', { ascending: false });
    
    if (kycError) {
      console.error('Error fetching KYC verifications:', kycError);
      throw kycError;
    }
    
    console.log(`Raw KYC data fetched: ${kycData?.length || 0} records (count: ${count})`);
    console.log('Pending KYC count:', kycData?.filter(item => item.status === 'pending').length || 0);
    
    if (!kycData || kycData.length === 0) {
      console.log('No KYC verifications found in database');
      return [];
    }
    
    // Log the first few records for debugging
    console.log('First 3 KYC records:', kycData?.slice(0, 3));
    
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
    
    console.log('KYC verifications fetched with profiles:', enhancedKycData.length);
    console.log('Pending KYC with profiles:', enhancedKycData.filter(item => item.status === 'pending').length);
    
    return enhancedKycData;
  } catch (error) {
    console.error('Exception in fetchKycVerifications:', error);
    throw error;
  }
};

// Function for testing direct database access without joins
export const testDirectKycAccess = async (): Promise<{count: number, pendingCount: number}> => {
  try {
    console.log('Testing direct KYC database access...');
    
    // Get all KYC records
    const { data, error, count } = await supabase
      .from('kyc_verifications')
      .select('*', { count: 'exact' });
    
    if (error) {
      console.error('Direct KYC access test error:', error);
      throw error;
    }
    
    const pendingCount = data?.filter(item => item.status === 'pending').length || 0;
    
    console.log(`Direct KYC access test results: ${count} total records, ${pendingCount} pending`);
    
    return {
      count: count || 0,
      pendingCount
    };
  } catch (error) {
    console.error('Exception in testDirectKycAccess:', error);
    throw error;
  }
};

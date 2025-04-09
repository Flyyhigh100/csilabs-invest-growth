
import { supabase } from '@/integrations/supabase/client';

/**
 * Check the current status of a user's KYC verification
 * @param userId The ID of the user
 * @returns The KYC status or null if not found
 */
export const checkVerificationStatus = async (userId: string): Promise<string | null> => {
  if (!userId) return null;
  
  try {
    const { data, error } = await supabase
      .from('kyc_verifications')
      .select('status')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) {
      console.error('Error checking KYC status:', error);
      throw error;
    }
    
    return data?.status || null;
  } catch (error) {
    console.error('Failed to check verification status:', error);
    return null;
  }
};

/**
 * Get detailed information about a user's KYC verification
 * @param userId The ID of the user
 * @returns Detailed KYC verification information or null if not found
 */
export const getVerificationDetails = async (userId: string): Promise<any | null> => {
  if (!userId) return null;
  
  try {
    const { data, error } = await supabase
      .from('kyc_verifications')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (error) {
      console.error('Error fetching KYC details:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Failed to get verification details:', error);
    return null;
  }
};

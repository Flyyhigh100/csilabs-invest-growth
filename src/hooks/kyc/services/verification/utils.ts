
import { supabase } from '@/integrations/supabase/client';

/**
 * Format error information from a Supabase error
 * @param error The Supabase error
 * @returns Formatted error object
 */
export const formatSupabaseError = (error: any): any => {
  if (!error) return null;
  
  return {
    message: error.message,
    code: error.code,
    details: error.details
  };
};

/**
 * Check if a KYC record exists and create it if it doesn't
 * @param userId User ID to check
 * @returns Boolean indicating success
 */
export const ensureKycRecord = async (userId: string): Promise<boolean> => {
  if (!userId) return false;
  
  try {
    // First check if record exists
    const { data: existingRecord, error: checkError } = await supabase
      .from('kyc_verifications')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (checkError) {
      console.error('Error checking KYC record:', checkError);
      return false;
    }
    
    // If record doesn't exist, create it
    if (!existingRecord) {
      const { error: insertError } = await supabase
        .from('kyc_verifications')
        .insert({ 
          user_id: userId, 
          status: 'not_started'
        });
        
      if (insertError) {
        console.error('Error creating KYC record:', insertError);
        return false;
      }
      
      console.log('KYC record created for user:', userId);
    }
    
    return true;
  } catch (error) {
    console.error('Failed to ensure KYC record exists:', error);
    return false;
  }
};

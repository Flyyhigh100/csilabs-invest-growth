
import { supabase } from '@/integrations/supabase/client';

// Submit KYC verification for review
export const submitKycVerification = async (userId: string): Promise<boolean> => {
  console.log('Submitting KYC verification for user:', userId);
  
  try {
    // Ensure KYC record exists and has all required fields
    const { data: kycData, error: kycError } = await supabase
      .from('kyc_verifications')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (kycError) {
      console.error('Error fetching KYC verification:', kycError);
      throw kycError;
    }
    
    if (!kycData) {
      console.error('No KYC record found for user');
      throw new Error('No KYC record found');
    }
    
    if (!kycData.first_name || !kycData.last_name || !kycData.date_of_birth || 
        !kycData.nationality || !kycData.address || !kycData.city || 
        !kycData.postal_code || !kycData.country || !kycData.id_front_url || 
        !kycData.id_back_url || !kycData.selfie_url) {
      console.error('KYC record is missing required fields');
      throw new Error('Please complete all required fields before submitting');
    }
    
    // Update status to 'pending' and set submitted_at timestamp
    const { data, error } = await supabase
      .from('kyc_verifications')
      .update({
        status: 'pending',
        submitted_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select('*'); // Add .select() to return the updated record
    
    if (error) {
      console.error('Error submitting KYC verification:', error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.error('No data returned after update');
      throw new Error('Failed to update KYC verification status');
    }
    
    console.log('KYC verification submitted successfully', data[0]);
    return true;
  } catch (error) {
    console.error('Exception in submitKycVerification:', error);
    throw error;
  }
};


import { supabase } from '@/integrations/supabase/client';

// Submit KYC verification for review
export const submitKycVerification = async (userId: string): Promise<boolean> => {
  console.log('🔍 Submitting KYC verification for user:', userId);
  
  try {
    // Ensure KYC record exists and has all required fields
    const { data: kycData, error: kycError } = await supabase
      .from('kyc_verifications')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (kycError) {
      console.error('❌ Error fetching KYC verification:', kycError);
      throw kycError;
    }
    
    if (!kycData) {
      console.error('❌ No KYC record found for user');
      throw new Error('No KYC record found');
    }
    
    // Validate all required fields
    if (!kycData.first_name || !kycData.last_name || !kycData.date_of_birth || 
        !kycData.nationality || !kycData.address || !kycData.city || 
        !kycData.postal_code || !kycData.country || !kycData.id_front_url || 
        !kycData.id_back_url || !kycData.selfie_url) {
      console.error('❌ KYC record is missing required fields');
      throw new Error('Please complete all required fields before submitting');
    }
    
    // Check if status is already pending or approved
    if (kycData.status === 'pending' || kycData.status === 'approved') {
      console.log('ℹ️ KYC verification already submitted or approved');
      return true; // Return success without doing anything
    }

    console.log('📝 Updating KYC verification status to pending...');
    
    // Use upsert to ensure we're updating the correct record
    const { error: updateError } = await supabase
      .from('kyc_verifications')
      .update({
        status: 'pending',
        submitted_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select();
    
    if (updateError) {
      console.error('❌ Error updating KYC verification:', updateError);
      throw updateError;
    }
    
    // Verify the update was successful by fetching the updated record
    const { data: verifyData, error: verifyError } = await supabase
      .from('kyc_verifications')
      .select('status, submitted_at')
      .eq('user_id', userId)
      .single();
      
    if (verifyError) {
      console.error('❌ Error verifying KYC update:', verifyError);
      throw verifyError;
    }
    
    if (verifyData.status !== 'pending') {
      console.error('❌ KYC status not updated correctly. Current status:', verifyData.status);
      throw new Error('Failed to update KYC status');
    }
    
    console.log('✅ KYC verification submitted successfully. Status:', verifyData.status);
    console.log('📅 Submitted at:', verifyData.submitted_at);
    
    return true;
  } catch (error) {
    console.error('❌ Exception in submitKycVerification:', error);
    throw error;
  }
};

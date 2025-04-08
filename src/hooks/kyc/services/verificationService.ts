
import { supabase } from '@/integrations/supabase/client';

// Submit KYC verification for review
export const submitKycVerification = async (userId: string): Promise<boolean> => {
  console.log('🚀 Submitting KYC verification for user:', userId);
  
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
    
    console.log('📋 Current KYC data:', kycData);
    
    // Manually check each required field instead of using JSON operators
    // This avoids the "operator does not exist: text ->> unknown" error
    if (!kycData.first_name || !kycData.last_name || !kycData.date_of_birth || 
        !kycData.nationality || !kycData.address || !kycData.city || 
        !kycData.postal_code || !kycData.country || !kycData.id_front_url || 
        !kycData.id_back_url || !kycData.selfie_url) {
      console.error('❌ KYC record is missing required fields');
      throw new Error('Please complete all required fields before submitting');
    }
    
    // Log the current status before updating
    console.log('🔍 Current KYC status:', kycData.status);
    
    // Update status to 'pending' and set submitted_at timestamp
    const currentTime = new Date().toISOString();
    console.log('⏰ Setting submitted_at to:', currentTime);
    
    const { data, error } = await supabase
      .from('kyc_verifications')
      .update({
        status: 'pending',
        submitted_at: currentTime
      })
      .eq('user_id', userId)
      .select();
    
    if (error) {
      console.error('❌ Error submitting KYC verification:', error);
      throw error;
    }
    
    console.log('✅ KYC status update result:', data);
    
    // Verify the update was successful by checking the returned data
    if (!data || data.length === 0 || data[0]?.status !== 'pending') {
      console.error('⚠️ KYC status update may have failed, returned data:', data);
      // Try to fetch the current status to confirm
      const { data: checkData } = await supabase
        .from('kyc_verifications')
        .select('status, submitted_at')
        .eq('user_id', userId)
        .single();
      
      console.log('🔍 Verification check - current KYC status:', checkData);
      
      if (checkData?.status !== 'pending') {
        console.error('❌ KYC status update failed, status is still:', checkData?.status);
        return false;
      }
    }
    
    // Create a notification for the user about the KYC submission
    try {
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title: 'KYC Verification Submitted',
          message: 'Your identity verification has been submitted and is under review.',
          type: 'kyc'
        });
      
      if (notificationError) {
        console.error('⚠️ Error creating notification:', notificationError);
        // Don't throw here, as the KYC submission was successful
      } else {
        console.log('✅ Notification created successfully');
      }
    } catch (notifError) {
      console.error('⚠️ Exception in notification creation:', notifError);
      // Continue as notification is not critical
    }
    
    console.log('🎉 KYC verification submitted successfully');
    return true;
  } catch (error) {
    console.error('❌ Exception in submitKycVerification:', error);
    throw error;
  }
};

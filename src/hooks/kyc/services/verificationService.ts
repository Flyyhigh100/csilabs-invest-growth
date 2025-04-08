
import { supabase } from '@/integrations/supabase/client';
import { clearAllToasts, showLoadingToast, dismissToast } from '@/utils/admin/kyc/verification/utils/toastManager';
import { isKycLocked, setKycLock, releaseKycLock } from '@/utils/admin/kyc/verification/utils/lockManager';

// Submit KYC verification for review
export const submitKycVerification = async (userId: string): Promise<boolean> => {
  // Define a unique ID for this operation - helps with debugging and preventing duplicate submissions
  const operationId = `submit-kyc-${Date.now()}`;
  console.log(`[${operationId}] 🚀 Submitting KYC verification for user:`, userId);
  
  // Check if there's already a lock for this user's KYC submission
  if (isKycLocked(userId)) {
    console.warn(`[${operationId}] ⚠️ KYC submission already in progress for this user`);
    return false;
  }
  
  // Set lock to prevent multiple submissions
  setKycLock(userId);
  
  // Show loading toast
  showLoadingToast('Submitting verification...', 'kyc-submission-toast');
  
  try {
    // Ensure KYC record exists and has all required fields
    const { data: kycData, error: kycError } = await supabase
      .from('kyc_verifications')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (kycError) {
      console.error(`[${operationId}] ❌ Error fetching KYC verification:`, kycError);
      dismissToast('kyc-submission-toast');
      releaseKycLock(userId);
      throw kycError;
    }
    
    if (!kycData) {
      console.error(`[${operationId}] ❌ No KYC record found for user`);
      dismissToast('kyc-submission-toast');
      releaseKycLock(userId);
      throw new Error('No KYC record found');
    }
    
    console.log(`[${operationId}] 📋 Current KYC data:`, kycData);
    
    // Manually check each required field instead of using JSON operators
    // This avoids the "operator does not exist: text ->> unknown" error
    if (!kycData.first_name || !kycData.last_name || !kycData.date_of_birth || 
        !kycData.nationality || !kycData.address || !kycData.city || 
        !kycData.postal_code || !kycData.country || !kycData.id_front_url || 
        !kycData.id_back_url || !kycData.selfie_url) {
      const errorMsg = 'Please complete all required fields before submitting';
      console.error(`[${operationId}] ❌ KYC record is missing required fields`);
      dismissToast('kyc-submission-toast');
      releaseKycLock(userId);
      throw new Error(errorMsg);
    }
    
    // Log the current status before updating
    console.log(`[${operationId}] 🔍 Current KYC status:`, kycData.status);
    
    // Update status to 'pending' and set submitted_at timestamp
    const currentTime = new Date().toISOString();
    console.log(`[${operationId}] ⏰ Setting submitted_at to:`, currentTime);
    
    const { data, error } = await supabase
      .from('kyc_verifications')
      .update({
        status: 'pending',
        submitted_at: currentTime
      })
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) {
      console.error(`[${operationId}] ❌ Error submitting KYC verification:`, error);
      dismissToast('kyc-submission-toast');
      releaseKycLock(userId);
      throw error;
    }
    
    console.log(`[${operationId}] ✅ KYC status update result:`, data);
    
    // Verify the update was successful by checking the returned data
    if (!data || data.status !== 'pending') {
      console.error(`[${operationId}] ⚠️ KYC status update may have failed, returned data:`, data);
      
      // Try to fetch the current status to confirm
      const { data: checkData } = await supabase
        .from('kyc_verifications')
        .select('status, submitted_at')
        .eq('user_id', userId)
        .single();
      
      console.log(`[${operationId}] 🔍 Verification check - current KYC status:`, checkData);
      
      if (checkData?.status !== 'pending') {
        console.error(`[${operationId}] ❌ KYC status update failed, status is still:`, checkData?.status);
        dismissToast('kyc-submission-toast');
        releaseKycLock(userId);
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
        console.error(`[${operationId}] ⚠️ Error creating notification:`, notificationError);
        // Don't throw here, as the KYC submission was successful
      } else {
        console.log(`[${operationId}] ✅ Notification created successfully`);
      }
    } catch (notifError) {
      console.error(`[${operationId}] ⚠️ Exception in notification creation:`, notifError);
      // Continue as notification is not critical
    }
    
    console.log(`[${operationId}] 🎉 KYC verification submitted successfully`);
    dismissToast('kyc-submission-toast');
    releaseKycLock(userId, 5000); // Release lock with longer delay to prevent immediate resubmission
    return true;
  } catch (error) {
    console.error(`[${operationId}] ❌ Exception in submitKycVerification:`, error);
    dismissToast('kyc-submission-toast');
    releaseKycLock(userId);
    throw error;
  }
};

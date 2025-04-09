
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { isKycLocked, setKycLock, releaseKycLock } from '@/utils/admin/kyc/verification/utils/lockManager';

// Submit KYC verification for review
export const submitKycVerification = async (userId: string): Promise<boolean> => {
  if (!userId) {
    console.error('User ID is required for KYC submission');
    toast.error('Authentication error. Please log in again.');
    return false;
  }
  
  // Define a unique ID for this operation - helps with debugging and preventing duplicate submissions
  const operationId = `submit-kyc-${Date.now()}`;
  console.log(`[${operationId}] 🚀 Submitting KYC verification for user:`, userId);
  
  // Check if there's already a lock for this user's KYC submission
  if (isKycLocked(userId)) {
    console.warn(`[${operationId}] ⚠️ KYC submission already in progress for this user`);
    toast.info('Submission already in progress, please wait...');
    return false;
  }
  
  // Set lock to prevent multiple submissions
  setKycLock(userId);
  
  // Show loading toast
  const toastId = 'kyc-submission-toast';
  toast.loading('Submitting verification...', { id: toastId });
  
  try {
    // First, check if KYC record exists
    const { data: kycData, error: kycError } = await supabase
      .from('kyc_verifications')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (kycError) {
      console.error(`[${operationId}] ❌ Error fetching KYC verification:`, kycError);
      toast.dismiss(toastId);
      toast.error(`Submission error: ${kycError.message || 'Failed to retrieve your verification data'}`);
      releaseKycLock(userId);
      return false;
    }
    
    if (!kycData) {
      console.error(`[${operationId}] ❌ No KYC record found for user`);
      toast.dismiss(toastId);
      toast.error('No verification record found. Please complete all information first.');
      releaseKycLock(userId);
      return false;
    }
    
    // Log current status and data for debugging
    console.log(`[${operationId}] 📋 Current KYC data:`, kycData);
    console.log(`[${operationId}] 🔍 Current KYC status:`, kycData.status);
    
    // Manually check required fields
    if (!kycData.first_name || !kycData.last_name || !kycData.date_of_birth || 
        !kycData.nationality || !kycData.address || !kycData.city || 
        !kycData.postal_code || !kycData.country || !kycData.id_front_url || 
        !kycData.id_back_url || !kycData.selfie_url) {
      const errorMsg = 'Please complete all required fields before submitting';
      console.error(`[${operationId}] ❌ KYC record is missing required fields`);
      toast.dismiss(toastId);
      toast.error(errorMsg);
      releaseKycLock(userId);
      return false;
    }
    
    // Set timestamp for submission
    const currentTime = new Date().toISOString();
    console.log(`[${operationId}] ⏰ Setting submitted_at to:`, currentTime);
    
    // Critical section: Update the status to pending and set submission timestamp
    // This is the part that was likely failing before
    const { error: updateError, data: updateData } = await supabase
      .from('kyc_verifications')
      .update({
        status: 'pending',
        submitted_at: currentTime
      })
      .eq('user_id', userId)
      .select('status, submitted_at'); // Add .select() to verify the update worked
    
    // Check for update errors
    if (updateError) {
      console.error(`[${operationId}] ❌ Error updating KYC status:`, updateError);
      toast.dismiss(toastId);
      toast.error(`Failed to update verification status: ${updateError.message}`);
      releaseKycLock(userId);
      return false;
    }
    
    // Double-check that the update was successful by verifying the returned data
    if (!updateData || updateData.length === 0 || updateData[0].status !== 'pending') {
      console.error(`[${operationId}] ⚠️ Update might have failed - returned data:`, updateData);
      
      // Make another verification query to check the status directly
      const { data: verifyData } = await supabase
        .from('kyc_verifications')
        .select('status, submitted_at')
        .eq('user_id', userId)
        .single();
      
      console.log(`[${operationId}] 🔍 Verification status after double-check:`, verifyData);
      
      if (!verifyData || verifyData.status !== 'pending') {
        console.error(`[${operationId}] ❌ Status update failed - current status:`, verifyData?.status);
        toast.dismiss(toastId);
        toast.error('Failed to update verification status. Please try again.');
        releaseKycLock(userId);
        return false;
      }
    }
    
    // Success path - create a notification for the user
    try {
      await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          title: 'KYC Verification Submitted',
          message: 'Your identity verification has been submitted and is under review.',
          type: 'kyc'
        });
      
      console.log(`[${operationId}] ✅ Notification created successfully`);
    } catch (notifError) {
      console.error(`[${operationId}] ⚠️ Exception in notification creation:`, notifError);
      // Continue as notification is not critical
    }
    
    // Everything succeeded
    console.log(`[${operationId}] 🎉 KYC verification submitted successfully`);
    toast.dismiss(toastId);
    toast.success('Verification submitted successfully! We will review your information shortly.');
    releaseKycLock(userId, 5000); // Release lock with longer delay to prevent immediate resubmission
    return true;
  } catch (error) {
    console.error(`[${operationId}] ❌ Exception in submitKycVerification:`, error);
    toast.dismiss(toastId);
    toast.error(`Submission error: ${(error as Error).message || 'Unknown error occurred'}`);
    releaseKycLock(userId);
    return false;
  }
};

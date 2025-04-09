
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { isKycLocked, setKycLock, releaseKycLock } from '@/utils/admin/kyc/verification/utils/lockManager';
import { 
  showLoadingToast, 
  dismissToast, 
  showSuccessToast, 
  showErrorToast 
} from '@/utils/admin/kyc/verification/utils/toastManager';

// Submit KYC verification for review
export const submitKycVerification = async (userId: string): Promise<boolean> => {
  if (!userId) {
    console.error('User ID is required for KYC submission');
    showErrorToast('Authentication error. Please log in again.');
    return false;
  }
  
  // Define a unique ID for this operation - helps with debugging
  const operationId = `submit-kyc-${Date.now()}`;
  console.log(`[${operationId}] 🚀 Submitting KYC verification for user:`, userId);
  
  // Check if there's already a lock for this user's KYC submission
  if (isKycLocked(userId)) {
    console.warn(`[${operationId}] ⚠️ KYC submission already in progress for this user`);
    showErrorToast('Submission already in progress, please wait...');
    return false;
  }
  
  // Set lock to prevent multiple submissions
  setKycLock(userId);
  
  // Show loading toast
  const toastId = 'kyc-submission-toast';
  showLoadingToast('Submitting verification...', toastId);
  
  try {
    // SIMPLIFIED APPROACH:
    // 1. First update the status to "pending" directly in Supabase
    console.log(`[${operationId}] Step 1: Updating status to pending`);
    
    const currentTime = new Date().toISOString();
    
    // Direct update - simpler approach
    const { error: updateError } = await supabase
      .from('kyc_verifications')
      .update({ 
        status: 'pending', 
        submitted_at: currentTime,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);
    
    if (updateError) {
      console.error(`[${operationId}] ❌ Error updating KYC status:`, updateError);
      throw updateError;
    }
    
    console.log(`[${operationId}] ✅ KYC status updated successfully to pending`);
    
    // Verify the update was successful
    const { data: verifyData, error: verifyError } = await supabase
      .from('kyc_verifications')
      .select('status, submitted_at')
      .eq('user_id', userId)
      .single();
    
    if (verifyError) {
      console.warn(`[${operationId}] ⚠️ Could not verify status update:`, verifyError);
    } else {
      console.log(`[${operationId}] 📊 Verified status after update:`, verifyData);
    }
    
    // 2. Create notification for the user
    try {
      console.log(`[${operationId}] Step 2: Creating notification`);
      
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
    dismissToast(toastId);
    showSuccessToast('Verification submitted successfully! We will review your information shortly.');
    
    // Release lock with longer delay to prevent immediate resubmission
    releaseKycLock(userId, 5000);
    return true;
  } catch (error) {
    console.error(`[${operationId}] ❌ Exception in submitKycVerification:`, error);
    dismissToast(toastId);
    showErrorToast(`Submission error: ${(error as Error).message || 'Unknown error occurred'}`);
    releaseKycLock(userId);
    return false;
  }
};

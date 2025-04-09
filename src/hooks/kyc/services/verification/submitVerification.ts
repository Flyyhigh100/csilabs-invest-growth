
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  showLoadingToast, 
  dismissToast, 
  showSuccessToast, 
  showErrorToast 
} from '@/utils/admin/kyc/verification/utils/toastManager';
import { isKycLocked, setKycLock, releaseKycLock } from '@/utils/admin/kyc/verification/utils/lockManager';

/**
 * Submit KYC verification for review
 * @param userId User ID to submit verification for
 * @returns Object with success status and debug information
 */
export const submitKycVerification = async (userId: string): Promise<{ success: boolean; debugInfo: any }> => {
  if (!userId) {
    console.error('User ID is required for KYC submission');
    showErrorToast('Authentication error. Please log in again.');
    return { 
      success: false, 
      debugInfo: { error: 'User ID required', userId }
    };
  }
  
  // Define a unique ID for this operation - helps with debugging
  const operationId = `submit-kyc-${Date.now()}`;
  console.log(`[${operationId}] 🚀 Submitting KYC verification for user:`, userId);
  
  // Check if there's already a lock for this user's KYC submission
  if (isKycLocked(userId)) {
    console.warn(`[${operationId}] ⚠️ KYC submission already in progress for this user`);
    showErrorToast('Submission already in progress, please wait...');
    return { 
      success: false, 
      debugInfo: { error: 'Submission locked', userId }
    };
  }
  
  // Set lock to prevent multiple submissions
  setKycLock(userId);
  
  // Show loading toast
  const toastId = 'kyc-submission-toast';
  showLoadingToast('Submitting verification...', toastId);
  
  // Create a debug info object to capture all relevant data
  const debugInfo: any = {
    operation: 'submitKycVerification',
    operationId,
    userId,
    timestamp: new Date().toISOString(),
    supabaseResponses: [],
    errors: []
  };
  
  try {
    // SIMPLIFIED APPROACH:
    // 1. First update the status to "pending" directly in Supabase
    console.log(`[${operationId}] Step 1: Updating status to pending`);
    
    const currentTime = new Date().toISOString();
    
    // Fixed update query - using standard equality operator for user_id
    const { data: updateData, error: updateError } = await supabase
      .from('kyc_verifications')
      .update({ 
        status: 'pending', 
        submitted_at: currentTime,
        updated_at: currentTime
      })
      .eq('user_id', userId)
      .select();
    
    // Add response to debug info
    debugInfo.supabaseResponses.push({
      type: 'update',
      data: updateData,
      error: updateError ? { message: updateError.message, code: updateError.code, details: updateError.details } : null,
      query: {
        table: 'kyc_verifications',
        action: 'update',
        values: { status: 'pending', submitted_at: currentTime, updated_at: currentTime },
        filter: { user_id: userId }
      }
    });
    
    if (updateError) {
      console.error(`[${operationId}] ❌ Error updating KYC status:`, updateError);
      debugInfo.errors.push({
        stage: 'update',
        message: updateError.message,
        code: updateError.code,
        details: updateError.details
      });
      throw updateError;
    }
    
    console.log(`[${operationId}] ✅ KYC status updated successfully to pending`);
    
    // Verify the update was successful
    const { data: verifyData, error: verifyError } = await supabase
      .from('kyc_verifications')
      .select('status, submitted_at, id')
      .eq('user_id', userId)
      .maybeSingle();
    
    // Add verify response to debug info
    debugInfo.supabaseResponses.push({
      type: 'verify',
      data: verifyData,
      error: verifyError ? { message: verifyError.message, code: verifyError.code, details: verifyError.details } : null,
      query: {
        table: 'kyc_verifications',
        action: 'select',
        fields: 'status, submitted_at, id',
        filter: { user_id: userId }
      }
    });
    
    if (verifyError) {
      console.warn(`[${operationId}] ⚠️ Could not verify status update:`, verifyError);
      debugInfo.errors.push({
        stage: 'verify',
        message: verifyError.message,
        code: verifyError.code,
        details: verifyError.details
      });
    } else {
      console.log(`[${operationId}] 📊 Verified status after update:`, verifyData);
      debugInfo.kycStatus = verifyData?.status;
      debugInfo.kycId = verifyData?.id;
    }
    
    // Call the notification creation function
    try {
      await createSubmissionNotification(operationId, userId, debugInfo);
    } catch (notifError) {
      // Log but continue as notification is not critical
      console.error(`[${operationId}] ⚠️ Exception in notification creation:`, notifError);
      debugInfo.errors.push({
        stage: 'notification',
        message: (notifError as Error).message,
        stack: (notifError as Error).stack
      });
    }
    
    // Everything succeeded
    console.log(`[${operationId}] 🎉 KYC verification submitted successfully`);
    dismissToast(toastId);
    showSuccessToast('Verification submitted successfully! We will review your information shortly.');
    
    // Release lock with longer delay to prevent immediate resubmission
    releaseKycLock(userId, 5000);
    debugInfo.success = true;
    return { success: true, debugInfo };
  } catch (error) {
    console.error(`[${operationId}] ❌ Exception in submitKycVerification:`, error);
    dismissToast(toastId);
    
    const errorMessage = (error as Error).message || 'Unknown error occurred';
    showErrorToast(`Submission error: ${errorMessage}`);
    
    // Add final error to debug info
    debugInfo.errors.push({
      stage: 'final',
      message: errorMessage,
      stack: (error as Error).stack
    });
    debugInfo.success = false;
    
    releaseKycLock(userId);
    return { success: false, debugInfo };
  }
};

/**
 * Create a notification for the user when they submit their KYC verification
 */
async function createSubmissionNotification(
  operationId: string, 
  userId: string, 
  debugInfo: any
): Promise<void> {
  console.log(`[${operationId}] Step 2: Creating notification`);
  
  const { data: notifyData, error: notifyError } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      title: 'KYC Verification Submitted',
      message: 'Your identity verification has been submitted and is under review.',
      type: 'kyc'
    })
    .select();
  
  // Add notification response to debug info
  debugInfo.supabaseResponses.push({
    type: 'notification',
    data: notifyData,
    error: notifyError ? { message: notifyError.message, code: notifyError.code, details: notifyError.details } : null,
    query: {
      table: 'notifications',
      action: 'insert',
      values: {
        user_id: userId,
        title: 'KYC Verification Submitted',
        message: 'Your identity verification has been submitted and is under review.',
        type: 'kyc'
      }
    }
  });
  
  if (notifyError) {
    console.warn(`[${operationId}] ⚠️ Error creating notification:`, notifyError);
    debugInfo.errors.push({
      stage: 'notification',
      message: notifyError.message,
      code: notifyError.code,
      details: notifyError.details
    });
    throw notifyError;
  } else {
    console.log(`[${operationId}] ✅ Notification created successfully`);
  }
}

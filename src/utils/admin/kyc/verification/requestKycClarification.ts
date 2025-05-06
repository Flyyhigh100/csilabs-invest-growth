
import { supabase } from '@/integrations/supabase/client';
import { verifyAdminPermissions } from './adminVerifier';
import { isKycLocked, setKycLock, releaseKycLock } from './utils/lockManager';
import { showSmartNotification, dismissAllToasts } from '@/utils/notification/smartNotifications';

/**
 * Request clarification for a KYC verification
 */
export const requestKycClarification = async (
  kycId: string,
  message: string
): Promise<boolean> => {
  // Generate a unique operation ID for tracing through logs
  const operationId = `kyc-clarify-${Date.now()}`;
  
  // Prevent multiple simultaneous calls for the same KYC ID
  if (isKycLocked(kycId)) {
    console.log(`🔒 [${operationId}] Already processing KYC ${kycId}. Please wait...`);
    showSmartNotification(
      'Operation in Progress', 
      'Already processing this KYC verification. Please wait...',
      { type: 'kyc_action', priority: 'medium' }
    );
    return false;
  }
  
  // Set the lock
  setKycLock(kycId);
  
  // Clear existing notifications
  dismissAllToasts();

  try {
    console.log(`🔍 [${operationId}] Requesting clarification for KYC ${kycId} with message: ${message}`);
    
    // Validate inputs
    if (!kycId) {
      showSmartNotification('Error', 'KYC ID is required', { type: 'kyc_error', priority: 'high' });
      releaseKycLock(kycId);
      return false;
    }
    
    if (!message || !message.trim()) {
      showSmartNotification('Error', 'Clarification message is required', { type: 'kyc_error', priority: 'high' });
      releaseKycLock(kycId);
      return false;
    }
    
    // Show loading notification
    const loadingToastId = `clarification-${kycId}-${Date.now()}`;
    showSmartNotification(
      'Processing', 
      'Requesting clarification...',
      { type: 'kyc_action', priority: 'medium', id: loadingToastId, duration: 15000 }
    );
    
    // Verify admin permissions
    try {
      const isAdmin = await verifyAdminPermissions();
      
      if (!isAdmin) {
        showSmartNotification(
          'Access Denied', 
          'You do not have permission to request clarification', 
          { type: 'kyc_error', priority: 'high' }
        );
        releaseKycLock(kycId);
        return false;
      }
    } catch (adminErr) {
      showSmartNotification(
        'Access Error', 
        `Failed to verify admin permissions: ${(adminErr as Error).message}`,
        { type: 'kyc_error', priority: 'high' }
      );
      releaseKycLock(kycId);
      return false;
    }
    
    // CRITICAL FIX: Match the exact payload structure expected by the edge function
    const payload = {
      action: 'requestKycClarification',  // This is the key that the edge function checks for
      data: {
        kycId,
        message
      }
    };

    console.log(`📤 [${operationId}] Sending payload to admin-operations function:`, JSON.stringify(payload));

    try {
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: payload
      });
      
      console.log(`📥 [${operationId}] Response from admin-operations:`, JSON.stringify({ data, error }));
      
      if (error) {
        console.error(`❌ [${operationId}] Error from admin-operations:`, error);
        showSmartNotification(
          'Error', 
          `Failed to request clarification: ${error.message || 'Unknown error'}`,
          { type: 'kyc_error', priority: 'high' }
        );
        releaseKycLock(kycId);
        return false;
      }
      
      if (!data?.kyc) {
        console.error(`❌ [${operationId}] Invalid response format:`, data);
        showSmartNotification(
          'Error', 
          'Invalid response format from server',
          { type: 'kyc_error', priority: 'high' }
        );
        releaseKycLock(kycId);
        return false;
      }
      
      // Successful operation
      showSmartNotification(
        'Success', 
        'Clarification requested successfully',
        { type: 'kyc_action', priority: 'high' }
      );
      
      console.log(`✅ [${operationId}] Clarification requested successfully`);
      releaseKycLock(kycId);
      return true;
    } catch (error) {
      console.error(`❌ [${operationId}] Error in requestKycClarification:`, error);
      showSmartNotification(
        'Error', 
        `Failed to request clarification: ${(error as Error).message}`,
        { type: 'kyc_error', priority: 'high' }
      );
      releaseKycLock(kycId);
      return false;
    }
  } catch (error) {
    console.error(`❌ [${operationId}] Fatal error in requestKycClarification:`, error);
    showSmartNotification(
      'Error',
      `Fatal error: ${(error as Error).message}`,
      { type: 'kyc_error', priority: 'high' }
    );
    releaseKycLock(kycId);
    return false;
  }
};

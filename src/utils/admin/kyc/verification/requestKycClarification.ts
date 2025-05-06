
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { verifyAdminPermissions } from './adminVerifier';
import { isKycLocked, setKycLock, releaseKycLock } from './utils/lockManager';
import { 
  setupVerificationListeners, 
  cleanupVerificationListeners, 
  notifyAdminPermissionStatus,
  notifyRetryAttempt
} from './utils/listenerManager';
import { clearAllToasts, showLoadingToast, dismissToast } from './utils/toastManager';
import { withTimeout } from './utils/retryManager';
import { showSmartNotification, dismissAllToasts } from '@/utils/notification/smartNotifications';

/**
 * Request clarification for KYC verification
 */
export const requestKycClarification = async (
  kycId: string,
  message: string
): Promise<boolean> => {
  // Validate inputs
  if (!kycId) {
    showSmartNotification('Error', 'KYC ID is required', { type: 'kyc_action', priority: 'high' });
    return false;
  }
  
  if (!message || !message.trim()) {
    showSmartNotification('Error', 'Clarification message is required', { type: 'kyc_action', priority: 'high' });
    return false;
  }
  
  // Generate an operation ID for tracking
  const operationId = `clarify-${Date.now()}`;
  console.log(`[${operationId}] 🚀 Starting clarification request:`, { kycId, message });
  
  // Prevent multiple simultaneous calls for the same KYC ID
  if (isKycLocked(kycId)) {
    console.log(`[${operationId}] 🔒 Already processing KYC ${kycId}. Please wait...`);
    showSmartNotification(
      'Operation in Progress', 
      'Already processing this KYC verification. Please wait...',
      { type: 'kyc_action', priority: 'medium' }
    );
    return false;
  }
  
  // Set the lock
  setKycLock(kycId);
  
  // Clear existing toasts
  dismissAllToasts();
  
  // Show a loading toast
  const loadingToastId = 'clarify-processing-toast';
  showLoadingToast('Processing clarification request...', loadingToastId);
  
  try {
    // Set up a timeout to automatically clear the pending state
    const safetyTimeout = setTimeout(() => {
      console.log(`⏰ [${operationId}] Safety timeout triggered after 30 seconds`);
      dismissToast(loadingToastId);
      showSmartNotification(
        'Operation Timeout', 
        'Operation timed out. Please check network connection and try again.',
        { type: 'kyc_action', priority: 'high' }
      );
      releaseKycLock(kycId);
    }, 30000); // 30 seconds timeout
    
    // Set up listeners
    setupVerificationListeners();
    
    // Verify admin permissions
    try {
      notifyAdminPermissionStatus('checking');
      
      const adminCheckPromise = verifyAdminPermissions();
      const isAdmin = await withTimeout(adminCheckPromise, 5000, 'Admin permission check timed out');
      
      if (!isAdmin) {
        clearTimeout(safetyTimeout);
        dismissToast(loadingToastId);
        showSmartNotification(
          'Access Denied', 
          'Admin permission verification failed',
          { type: 'admin_access', priority: 'high' }
        );
        notifyAdminPermissionStatus('failed');
        releaseKycLock(kycId);
        return false;
      }
      
      notifyAdminPermissionStatus('verified');
    } catch (adminErr) {
      clearTimeout(safetyTimeout);
      dismissToast(loadingToastId);
      showSmartNotification(
        'Access Error', 
        `Failed to verify admin permissions: ${(adminErr as Error).message}`,
        { type: 'admin_access', priority: 'high' }
      );
      notifyAdminPermissionStatus('failed');
      releaseKycLock(kycId);
      return false;
    }
    
    // Process clarification request
    console.log(`[${operationId}] 📤 Sending clarification request to Supabase for KYC ID: ${kycId}`);
    
    let maxRetries = 1;
    let currentRetry = 0;
    let success = false;
    let lastError: Error | null = null;
    
    while (currentRetry <= maxRetries) {
      notifyRetryAttempt(currentRetry, maxRetries);
      
      try {
        // CRITICAL FIX: Ensure payload structure exactly matches the edge function expectations
        const payload = {
          action: 'requestKycClarification',
          data: {
            kycId,
            message: message.trim()
          }
        };
        
        console.log(`[${operationId}] 📤 Sending payload:`, JSON.stringify(payload));
        
        const response = await withTimeout(
          supabase.functions.invoke('admin-operations', { body: payload }),
          8000,
          'Request timed out'
        );
        
        console.log(`[${operationId}] 📥 Received response:`, JSON.stringify(response));
        
        if (response.error) {
          console.error(`[${operationId}] ❌ Error from edge function:`, response.error);
          throw new Error(response.error.message || 'Error from admin-operations function');
        }
        
        if (!response.data?.kyc) {
          console.error(`[${operationId}] ❌ Invalid response format:`, response);
          throw new Error('Invalid response format from server');
        }
        
        if (response.data.kyc.status !== 'needs_clarification') {
          console.error(`[${operationId}] ❌ Status mismatch: got ${response.data.kyc.status}, expected needs_clarification`);
          throw new Error(`Status update failed: got ${response.data.kyc.status}, expected needs_clarification`);
        }
        
        success = true;
        break;
      } catch (error) {
        lastError = error as Error;
        console.error(`[${operationId}] Attempt ${currentRetry + 1} failed:`, error);
        
        if (currentRetry < maxRetries && 
            ((error as Error).message.includes('timeout') || 
             (error as Error).message.includes('network'))) {
          currentRetry++;
          await new Promise(resolve => setTimeout(resolve, 2000)); // 2-second delay
          continue;
        }
        
        break;
      }
    }
    
    // Clear the safety timeout
    clearTimeout(safetyTimeout);
    dismissToast(loadingToastId);
    
    // Handle result
    if (success) {
      console.log(`[${operationId}] ✅ Clarification request completed successfully`);
      showSmartNotification(
        'Success',
        'Clarification request sent successfully',
        { type: 'kyc_action', priority: 'high', id: `clarify-success-${kycId}` }
      );
      return true;
    } else {
      console.error(`[${operationId}] ❌ Clarification request failed:`, lastError);
      showSmartNotification(
        'Error',
        `Failed to send clarification request: ${lastError?.message || 'Unknown error'}`,
        { type: 'kyc_action', priority: 'high', id: `clarify-error-${kycId}` }
      );
      return false;
    }
  } catch (error) {
    console.error(`[${operationId}] ❌ Error processing clarification request:`, error);
    showSmartNotification(
      'Error',
      `Error: ${(error as Error).message}`,
      { type: 'kyc_action', priority: 'high' }
    );
    return false;
  } finally {
    // Clean up
    cleanupVerificationListeners();
    dismissToast(loadingToastId);
    releaseKycLock(kycId, 3000);  // Properly pass both parameters
  }
};

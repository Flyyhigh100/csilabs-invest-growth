
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

/**
 * Request clarification for KYC verification
 */
export const requestKycClarification = async (
  kycId: string,
  message: string
): Promise<boolean> => {
  // Validate inputs
  if (!kycId) {
    toast.error('KYC ID is required');
    return false;
  }
  
  if (!message || !message.trim()) {
    toast.error('Clarification message is required');
    return false;
  }
  
  // Generate an operation ID for tracking
  const operationId = `clarify-${Date.now()}`;
  console.log(`[${operationId}] 🚀 Starting clarification request:`, { kycId, message });
  
  // Prevent multiple simultaneous calls for the same KYC ID
  if (isKycLocked(kycId)) {
    console.log(`[${operationId}] 🔒 Already processing KYC ${kycId}. Please wait...`);
    toast.info(`Already processing this KYC verification. Please wait...`);
    return false;
  }
  
  // Set the lock
  setKycLock(kycId);
  
  // Clear existing toasts
  clearAllToasts();
  
  // Show a loading toast
  const loadingToastId = 'clarify-processing-toast';
  showLoadingToast('Processing clarification request...', loadingToastId);
  
  try {
    // Set up a timeout to automatically clear the pending state
    const safetyTimeout = setTimeout(() => {
      console.log(`⏰ [${operationId}] Safety timeout triggered after 30 seconds`);
      dismissToast(loadingToastId);
      toast.error('Operation timed out. Please check network connection and try again.');
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
        toast.error('Admin permission verification failed');
        notifyAdminPermissionStatus('failed');
        releaseKycLock(kycId);
        return false;
      }
      
      notifyAdminPermissionStatus('verified');
    } catch (adminErr) {
      clearTimeout(safetyTimeout);
      dismissToast(loadingToastId);
      toast.error(`Failed to verify admin permissions: ${(adminErr as Error).message}`);
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
        // Updated payload structure to match the expected format in the edge function
        const payload = {
          action: 'requestKycClarification',
          data: {
            kycId,
            message: message.trim()
          }
        };
        
        const response = await withTimeout(
          supabase.functions.invoke('admin-operations', { body: payload }),
          8000,
          'Request timed out'
        );
        
        if (response.error) {
          throw new Error(response.error.message || 'Error from admin-operations function');
        }
        
        if (!response.data?.kyc) {
          throw new Error('Invalid response format from server');
        }
        
        if (response.data.kyc.status !== 'needs_clarification') {
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
      toast.success('Clarification request sent successfully');
      return true;
    } else {
      console.error(`[${operationId}] ❌ Clarification request failed:`, lastError);
      toast.error(`Failed to send clarification request: ${lastError?.message || 'Unknown error'}`);
      return false;
    }
  } catch (error) {
    console.error(`[${operationId}] ❌ Error processing clarification request:`, error);
    toast.error(`Error: ${(error as Error).message}`);
    return false;
  } finally {
    // Clean up
    cleanupVerificationListeners();
    dismissToast(loadingToastId);
    releaseKycLock(kycId, 3000);  // Properly pass both parameters
  }
};


import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { verifyAdminPermissions } from './adminVerifier';
import { isKycLocked, setKycLock, releaseKycLock } from './utils/lockManager';
import { 
  setupVerificationListeners, 
  cleanupVerificationListeners, 
  notifyAdminPermissionStatus 
} from './utils/listenerManager';
import { clearAllToasts, showLoadingToast, dismissToast } from './utils/toastManager';
import { executeWithRetry, withTimeout } from './utils/retryManager';

interface EdgeFunctionResponse {
  data?: {
    kyc?: {
      status: string;
      [key: string]: any;
    };
    [key: string]: any;
  };
  error?: {
    message: string;
    code?: string;
    [key: string]: any;
  };
}

/**
 * Process KYC verification - approve or reject
 */
export const processKycVerification = async (
  kycId: string, 
  status: 'approved' | 'rejected' | 'needs_clarification',
  message?: string
): Promise<boolean> => {
  // Prevent multiple simultaneous calls for the same KYC ID
  if (isKycLocked(kycId)) {
    console.log(`🔒 Already processing KYC ${kycId} (${status}). Please wait...`);
    toast.info(`Already processing this KYC verification. Please wait...`);
    return false;
  }
  
  // Set the lock
  setKycLock(kycId);
  
  // Generate unique toast IDs for tracking this operation
  const toastId = `process-kyc-${kycId}-${Date.now()}`;
  const loadingToastId = `loading-${toastId}`;

  // Clear ALL existing toasts at the start
  clearAllToasts();

  try {
    console.log(`🔍 Processing KYC verification ${kycId} with status: ${status}, message: ${message || 'none'}`);
    
    if (!kycId) {
      toast.error('KYC ID is required');
      releaseKycLock(kycId);
      return false;
    }
    
    // Pre-validate required fields based on status
    if (status === 'rejected' && (!message || !message.trim())) {
      toast.error('Rejection reason is required');
      releaseKycLock(kycId);
      return false;
    }
    
    // Show a new loading toast with a reasonable timeout
    showLoadingToast(`Processing KYC verification (${status})...`, loadingToastId, 10000);
    
    // Set up listeners
    setupVerificationListeners();
    
    // Verify admin permissions first
    try {
      notifyAdminPermissionStatus('checking');
      
      const adminCheckPromise = verifyAdminPermissions();
      const isAdmin = await withTimeout(adminCheckPromise, 5000, 'Admin permission check timed out');
      
      if (!isAdmin) {
        dismissToast(loadingToastId);
        toast.error('Admin permission verification failed');
        notifyAdminPermissionStatus('failed');
        releaseKycLock(kycId);
        return false;
      }
      
      notifyAdminPermissionStatus('verified');
    } catch (adminErr) {
      dismissToast(loadingToastId);
      toast.error(`Failed to verify admin permissions: ${(adminErr as Error).message}`);
      notifyAdminPermissionStatus('failed');
      releaseKycLock(kycId);
      return false;
    }

    // Process KYC verification
    return await executeWithRetry(
      async () => {
        // Prepare the payload in the format expected by the edge function
        // This is the critical fix - matching the exact structure expected by the server
        const payload = {
          action: 'processKyc',
          data: {
            kycId,
            status,
            rejectionReason: message
          }
        };

        const response = await withTimeout(
          supabase.functions.invoke('admin-operations', { body: payload }),
          8000,
          'Request timed out'
        ) as EdgeFunctionResponse;

        if (response.error) {
          throw new Error(response.error.message || 'Error from admin-operations function');
        }

        if (!response.data?.kyc) {
          throw new Error('Invalid response format from server');
        }

        if (response.data.kyc.status !== status) {
          throw new Error(`Status update failed: got ${response.data.kyc.status}, expected ${status}`);
        }

        // Success case - clear loading state first
        dismissToast(loadingToastId);
        toast.success(`KYC verification ${status} successfully`);
        return true;
      },
      1,  // maxRetries
      2000  // retryDelay
    ).catch(error => {
      // Handle errors from the retry process
      dismissToast(loadingToastId);
      toast.error(`Failed to process KYC verification: ${error.message || 'Unknown error'}`);
      console.error('❌ Error in processKycVerification:', error);
      return false;
    }).finally(() => {
      // Always clean up
      cleanupVerificationListeners();
      releaseKycLock(kycId);
    });
  } catch (error) {
    console.error('❌ Fatal error in processKycVerification:', error);
    toast.error(`Fatal error: ${(error as Error).message}`);
    
    // Clean up
    cleanupVerificationListeners();
    dismissToast(loadingToastId);
    releaseKycLock(kycId);
    return false;
  }
};

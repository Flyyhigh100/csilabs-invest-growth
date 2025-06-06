
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
import { showSmartNotification, dismissAllToasts } from '@/utils/notification/smartNotifications';

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
  // Generate a unique operation ID for tracing through logs
  const operationId = `kyc-${status}-${Date.now()}`;
  
  // Prevent multiple simultaneous calls for the same KYC ID
  if (isKycLocked(kycId)) {
    console.log(`🔒 [${operationId}] Already processing KYC ${kycId} (${status}). Please wait...`);
    showSmartNotification(
      'Operation in Progress', 
      'Already processing this KYC verification. Please wait...',
      { type: 'kyc_action', priority: 'medium' }
    );
    return false;
  }
  
  // Set the lock
  setKycLock(kycId);
  
  // Generate unique toast IDs for tracking this operation
  const toastId = `process-kyc-${kycId}-${Date.now()}`;
  const loadingToastId = `loading-${toastId}`;

  // Clear ALL existing toasts at the start
  dismissAllToasts();

  try {
    console.log(`🔍 [${operationId}] Processing KYC verification ${kycId} with status: ${status}, message: ${message || 'none'}`);
    
    if (!kycId) {
      showSmartNotification('Error', 'KYC ID is required', { type: 'kyc_error', priority: 'high' });
      releaseKycLock(kycId);
      return false;
    }
    
    // Pre-validate required fields based on status
    if (status === 'rejected' && (!message || !message.trim())) {
      showSmartNotification('Error', 'Rejection reason is required', { type: 'kyc_error', priority: 'high' });
      releaseKycLock(kycId);
      return false;
    }
    
    // Show a new loading toast with increased timeout
    showLoadingToast(`Processing KYC verification (${status})...`, loadingToastId, 30000);
    
    // Set up listeners
    setupVerificationListeners();
    
    // Verify admin permissions first with increased timeout
    try {
      notifyAdminPermissionStatus('checking');
      
      const adminCheckPromise = verifyAdminPermissions();
      const isAdmin = await withTimeout(adminCheckPromise, 10000, 'Admin permission check timed out');
      
      if (!isAdmin) {
        dismissToast(loadingToastId);
        showSmartNotification(
          'Access Denied', 
          'Admin permission verification failed', 
          { type: 'kyc_error', priority: 'high' }
        );
        notifyAdminPermissionStatus('failed');
        releaseKycLock(kycId);
        return false;
      }
      
      notifyAdminPermissionStatus('verified');
    } catch (adminErr) {
      dismissToast(loadingToastId);
      showSmartNotification(
        'Access Error', 
        `Failed to verify admin permissions: ${(adminErr as Error).message}`,
        { type: 'kyc_error', priority: 'high' }
      );
      notifyAdminPermissionStatus('failed');
      releaseKycLock(kycId);
      return false;
    }

    // Process KYC verification with increased timeout and better error handling
    return await executeWithRetry(
      async () => {
        // Use the correct operation name that matches the edge function handler
        const payload = {
          operation: 'processKyc',  // This now matches the handler we just added
          data: {
            kycId,
            status,
            rejectionReason: message
          }
        };

        console.log(`📤 [${operationId}] Sending payload to admin-operations function:`, JSON.stringify(payload));

        const response = await withTimeout(
          supabase.functions.invoke('admin-operations', { body: payload }),
          15000, // Increased timeout from 8000 to 15000ms
          'Request timed out - please try again'
        ) as EdgeFunctionResponse;

        console.log(`📥 [${operationId}] Response from admin-operations:`, JSON.stringify(response));

        if (response.error) {
          console.error(`❌ [${operationId}] Error from admin-operations:`, response.error);
          throw new Error(response.error.message || 'Error from admin-operations function');
        }

        if (!response.data?.kyc && !response.data?.success) {
          console.error(`❌ [${operationId}] Invalid response format:`, response);
          throw new Error('Invalid response format from server');
        }

        // Check if the operation was successful
        if (response.data?.success || (response.data?.kyc && response.data.kyc.status === status)) {
          // Success case - clear loading state first
          dismissToast(loadingToastId);
          
          // Show success notification with the smart notification system
          showSmartNotification(
            'Success', 
            `KYC verification ${status} successfully`,
            { type: 'kyc_action', priority: 'high', id: `kyc-success-${kycId}` }
          );
          
          return true;
        } else {
          throw new Error(`Status update failed: expected ${status} but operation did not complete successfully`);
        }
      },
      3,  // Increased maxRetries from 2 to 3
      3000  // Increased retryDelay from 2000 to 3000ms
    ).catch(error => {
      // Handle errors from the retry process
      dismissToast(loadingToastId);
      showSmartNotification(
        'Error', 
        `Failed to process KYC verification: ${error.message || 'Unknown error'}`,
        { type: 'kyc_error', priority: 'high', id: `kyc-error-${kycId}` }
      );
      console.error(`❌ [${operationId}] Error in processKycVerification:`, error);
      return false;
    }).finally(() => {
      // Always clean up
      cleanupVerificationListeners();
      releaseKycLock(kycId);
    });
  } catch (error) {
    console.error(`❌ [${operationId}] Fatal error in processKycVerification:`, error);
    showSmartNotification(
      'Error',
      `Fatal error: ${(error as Error).message}`,
      { type: 'kyc_error', priority: 'high', id: `kyc-fatal-${kycId}` }
    );
    
    // Clean up
    cleanupVerificationListeners();
    dismissToast(loadingToastId);
    releaseKycLock(kycId);
    return false;
  }
};

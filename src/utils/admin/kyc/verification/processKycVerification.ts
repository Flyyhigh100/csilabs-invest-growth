import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { verifyAdminPermissions } from './adminVerifier';

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

// Add a debounce mechanism to prevent multiple simultaneous calls
let processingLock = false;
let lastProcessedKycId = '';
let lastProcessedTimestamp = 0;

/**
 * Process KYC verification - approve or reject
 */
export const processKycVerification = async (
  kycId: string, 
  status: 'approved' | 'rejected' | 'needs_clarification',
  message?: string
): Promise<boolean> => {
  // Prevent multiple simultaneous calls for the same KYC ID
  const now = Date.now();
  if (processingLock && kycId === lastProcessedKycId && (now - lastProcessedTimestamp) < 10000) {
    console.log(`🔒 Already processing KYC ${kycId} (${status}). Please wait...`);
    toast.info(`Already processing this KYC verification. Please wait...`);
    return false;
  }
  
  // Set the lock
  processingLock = true;
  lastProcessedKycId = kycId;
  lastProcessedTimestamp = now;
  
  // Generate unique toast IDs for tracking this operation
  const toastId = `process-kyc-${kycId}-${Date.now()}`;
  const loadingToastId = `loading-${toastId}`;

  // Clear ALL existing toasts at the start
  toast.dismiss();

  try {
    console.log(`🔍 Processing KYC verification ${kycId} with status: ${status}, message: ${message || 'none'}`);
    
    if (!kycId) {
      toast.error('KYC ID is required');
      processingLock = false;
      return false;
    }
    
    // Pre-validate required fields based on status
    if (status === 'rejected' && (!message || !message.trim())) {
      toast.error('Rejection reason is required');
      processingLock = false;
      return false;
    }
    
    // Show a new loading toast with a reasonable timeout
    toast.loading(`Processing KYC verification (${status})...`, {
      id: loadingToastId,
      duration: 10000 // Reduced to 10 seconds to prevent long-hanging states
    });
    
    // Verify admin permissions first with a timeout
    try {
      const adminCheckPromise = verifyAdminPermissions();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Admin permission check timed out')), 5000)
      );
      
      const isAdmin = await Promise.race([adminCheckPromise, timeoutPromise]);
      
      if (!isAdmin) {
        toast.dismiss(loadingToastId);
        toast.error('Admin permission verification failed');
        
        if (typeof (window as any).kycAdminPermissionListener === 'function') {
          (window as any).kycAdminPermissionListener('failed');
        }
        processingLock = false;
        return false;
      }
      
      if (typeof (window as any).kycAdminPermissionListener === 'function') {
        (window as any).kycAdminPermissionListener('verified');
      }
    } catch (adminErr) {
      toast.dismiss(loadingToastId);
      toast.error(`Failed to verify admin permissions: ${(adminErr as Error).message}`);
      
      if (typeof (window as any).kycAdminPermissionListener === 'function') {
        (window as any).kycAdminPermissionListener('failed');
      }
      processingLock = false;
      return false;
    }

    const payload = {
      action: 'processKyc',
      data: {
        kycId,
        status,
        rejectionReason: message
      }
    };

    let currentRetry = 0;
    const maxRetries = 1; // Reduced retries to prevent long-hanging states
    let lastError: Error | null = null;

    while (currentRetry <= maxRetries) {
      if (typeof (window as any).kycRetryListener === 'function') {
        (window as any).kycRetryListener(currentRetry, maxRetries);
      }

      try {
        const response = await Promise.race([
          supabase.functions.invoke('admin-operations', { body: payload }),
          new Promise<EdgeFunctionResponse>((_, reject) => 
            setTimeout(() => reject(new Error('Request timed out')), 8000) // Reduced timeout
          )
        ]) as EdgeFunctionResponse;

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
        toast.dismiss(loadingToastId);
        toast.success(`KYC verification ${status} successfully`);
        processingLock = false;
        return true;
      } catch (error) {
        lastError = error as Error;
        console.error(`Attempt ${currentRetry + 1} failed:`, error);

        // Only retry on specific network errors
        if (currentRetry < maxRetries && 
            ((error as Error).message.includes('timeout') || 
             (error as Error).message.includes('network'))) {
          currentRetry++;
          await new Promise(resolve => setTimeout(resolve, 2000)); // Fixed 2-second delay
          continue;
        }

        // Non-retryable error or max retries reached
        break;
      } finally {
        // Always clean up the loading toast for this attempt
        toast.dismiss(loadingToastId);
      }
    }

    // If we get here, all retries failed
    toast.error(`Failed to process KYC verification: ${lastError?.message || 'Unknown error'}`);
    processingLock = false;
    return false;
  } catch (error) {
    console.error('❌ Fatal error in processKycVerification:', error);
    toast.error(`Fatal error: ${(error as Error).message}`);
    
    // Clean up listeners
    if (typeof (window as any).kycRetryListener === 'function') {
      (window as any).kycRetryListener(null, null);
    }
    if (typeof (window as any).kycAdminPermissionListener === 'function') {
      (window as any).kycAdminPermissionListener('failed');
    }
    processingLock = false;
    return false;
  } finally {
    // Final cleanup of ALL toasts and listeners
    toast.dismiss(loadingToastId);
    delete (window as any).kycRetryListener;
    delete (window as any).kycAdminPermissionListener;
    
    // Release the lock after 2 seconds to prevent immediate retries
    setTimeout(() => {
      processingLock = false;
    }, 2000);
  }
};


import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { verifyAdminPermissions } from './adminVerifier';

/**
 * Process KYC verification - approve or reject
 */
export const processKycVerification = async (
  kycId: string, 
  status: 'approved' | 'rejected' | 'needs_clarification',
  message?: string
): Promise<boolean> => {
  try {
    console.log(`🔍 Processing KYC verification ${kycId} with status: ${status}, message: ${message || 'none'}`);
    
    // Generate unique toast IDs for tracking this operation
    const toastId = `process-kyc-${kycId}-${Date.now()}`;
    const loadingToastId = `loading-${toastId}`;
    
    if (!kycId) {
      toast.error('KYC ID is required');
      return false;
    }
    
    // Pre-validate required fields based on status
    if (status === 'rejected' && (!message || !message.trim())) {
      toast.error('Rejection reason is required');
      return false;
    }
    
    // Clear any existing toasts for this operation
    toast.dismiss(loadingToastId);
    
    // Show a new loading toast with a reasonable timeout
    toast.loading(`Processing KYC verification (${status})...`, {
      id: loadingToastId,
      duration: 20000 // 20 second duration for the loading toast
    });
    
    // Verify admin permissions
    try {
      const isAdmin = await verifyAdminPermissions();
      if (!isAdmin) {
        console.error('❌ Admin permission check failed');
        
        // Update listener if it exists
        if (typeof (window as any).kycAdminPermissionListener === 'function') {
          (window as any).kycAdminPermissionListener('failed');
        }
        
        toast.dismiss(loadingToastId);
        toast.error('Admin permission verification failed');
        return false;
      }
      
      console.log('✅ Admin permissions verified');
      
      // Update listener if it exists
      if (typeof (window as any).kycAdminPermissionListener === 'function') {
        (window as any).kycAdminPermissionListener('verified');
      }
    } catch (adminErr) {
      console.error('❌ Exception during admin permission check:', adminErr);
      
      // Update listener if it exists
      if (typeof (window as any).kycAdminPermissionListener === 'function') {
        (window as any).kycAdminPermissionListener('failed');
      }
      
      toast.dismiss(loadingToastId);
      toast.error(`Failed to verify admin permissions: ${(adminErr as Error).message}`);
      return false;
    }
    
    // Prepare payload for the function call
    const payload = {
      action: 'processKyc',
      data: {
        kycId,
        status,
        rejectionReason: message
      }
    };
    
    console.log(`Sending request payload:`, payload);
    
    // Set up retry variables
    const maxRetries = 2;
    let currentRetry = 0;
    let success = false;
    let lastError: Error | null = null;
    
    // Implement retry logic
    while (currentRetry <= maxRetries && !success) {
      // Update retry counter in UI if available
      if (typeof (window as any).kycRetryListener === 'function') {
        (window as any).kycRetryListener(currentRetry, maxRetries);
      }
      
      try {
        console.log(`Attempt ${currentRetry + 1}/${maxRetries + 1}: Processing KYC verification`);
        
        // Call the edge function with a timeout
        const timeoutPromise = new Promise<{error: string}>((_, reject) => {
          setTimeout(() => reject(new Error('Function call timed out after 10 seconds')), 10000);
        });
        
        // Actual function call
        const functionPromise = supabase.functions.invoke('admin-operations', { body: payload });
        
        // Race between timeout and function call
        const response = await Promise.race([functionPromise, timeoutPromise]);
        
        console.log('📥 Full response from admin-operations function:', response);
        
        if (response.error) {
          console.error(`❌ Error from admin-operations function (attempt ${currentRetry + 1}):`, response.error);
          lastError = new Error(response.error.message || 'Error from admin-operations function');
          currentRetry++;
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
          continue;
        }
        
        // Type guard to check if response has data property before accessing it
        if ('data' in response) {
          // Check if the response contains an error object
          if (response.data && typeof response.data === 'object' && 'error' in response.data) {
            console.error(`❌ Error from admin-operations response (attempt ${currentRetry + 1}):`, response.data.error);
            lastError = new Error(response.data.error.message || 'Unknown error from server');
            currentRetry++;
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
            continue;
          }
          
          // Handle case where response has no data
          if (!response.data) {
            console.error(`❌ No data returned from admin-operations function (attempt ${currentRetry + 1})`);
            lastError = new Error('No response data received');
            currentRetry++;
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
            continue;
          }
          
          // If we reach here without continuing to the next iteration, the operation was successful
          console.log(`✅ Successfully processed KYC verification with status: ${status}`, response.data);
          success = true;
          break;
        } else {
          console.error(`❌ Response does not contain data property (attempt ${currentRetry + 1})`);
          lastError = new Error('Invalid response format from server');
          currentRetry++;
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
          continue;
        }
      } catch (attemptError) {
        console.error(`❌ Exception during attempt ${currentRetry + 1}:`, attemptError);
        lastError = attemptError as Error;
        currentRetry++;
        
        if (currentRetry <= maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
        }
      }
    }
    
    // Clear the retry listener
    if (typeof (window as any).kycRetryListener === 'function') {
      (window as any).kycRetryListener(null, null);
    }
    
    // Dismiss the loading toast
    toast.dismiss(loadingToastId);
    
    // Handle the final result
    if (success) {
      // Trigger a refresh of KYC data immediately
      try {
        console.log('🔄 Triggering immediate fetch of KYC data after update');
        
        // Perform a direct check on the updated record
        const { data: refreshData, error: refreshError } = await supabase
          .from('kyc_verifications')
          .select('*')
          .eq('id', kycId)
          .single();
          
        if (refreshData) {
          console.log('✅ Verified KYC update with fresh data:', refreshData);
          console.log(`✅ Current KYC status is now: ${refreshData.status}`);
          
          // Show an appropriate confirmation toast
          toast.success(`KYC verification ${status === 'approved' ? 'approved' : 
            status === 'rejected' ? 'rejected' : 'updated'} successfully.`, {
            duration: 5000
          });
        } else if (refreshError) {
          console.error('❌ Error verifying KYC update:', refreshError);
          throw refreshError;
        }
      } catch (refreshErr) {
        console.error('❌ Exception during verification refresh:', refreshErr);
        
        // Still return success since the operation likely succeeded despite the refresh error
        toast.success(`KYC verification status updated to ${status}, but please verify the changes.`, {
          duration: 5000
        });
      }
      
      return true;
    } else {
      // Failed after all retry attempts
      toast.error(`Failed to process KYC verification after multiple attempts: ${lastError?.message || 'Unknown error'}`, {
        duration: 5000
      });
      
      return false;
    }
  } catch (error) {
    console.error('❌ Error processing KYC verification:', error);
    
    // Clear any loading toasts
    toast.dismiss();
    
    toast.error(`An error occurred while processing KYC verification: ${(error as Error).message}`, {
      duration: 5000
    });
    return false;
  }
};

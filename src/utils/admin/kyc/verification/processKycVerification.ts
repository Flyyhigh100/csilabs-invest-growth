
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { verifyAdminPermissions } from './adminVerifier';
import { executeWithRetries } from './retryUtils';

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
    
    if (!kycId) {
      toast.error('KYC ID is required');
      return false;
    }
    
    // Pre-validate required fields based on status
    if (status === 'rejected' && (!message || !message.trim())) {
      toast.error('Rejection reason is required');
      return false;
    }
    
    // Add debug toast to track the start of the process with a unique ID
    const toastId = `process-kyc-${kycId}-${Date.now()}`;
    toast.loading(`Processing KYC verification (${status})...`, {
      id: toastId,
      duration: 20000 // Longer duration to ensure it stays visible during processing
    });
    
    // Verify admin permissions with improved error handling
    try {
      const isAdmin = await verifyAdminPermissions();
      if (!isAdmin) {
        console.error('❌ Admin permission check failed');
        
        // Update the admin permission listener
        if (typeof (window as any).kycAdminPermissionListener === 'function') {
          (window as any).kycAdminPermissionListener('failed');
        }
        
        toast.dismiss(toastId);
        toast.error('Admin permission verification failed');
        return false;
      }
      
      console.log('✅ Admin permissions verified');
      
      // Update the admin permission listener
      if (typeof (window as any).kycAdminPermissionListener === 'function') {
        (window as any).kycAdminPermissionListener('verified');
      }
    } catch (adminErr) {
      console.error('❌ Exception during admin permission check:', adminErr);
      
      // Update the admin permission listener
      if (typeof (window as any).kycAdminPermissionListener === 'function') {
        (window as any).kycAdminPermissionListener('failed');
      }
      
      toast.dismiss(toastId);
      toast.error(`Failed to verify admin permissions: ${(adminErr as Error).message}`);
      return false;
    }
    
    // Fetch the current KYC record to verify it exists
    const { data: currentKyc, error: fetchError } = await supabase
      .from('kyc_verifications')
      .select('*')
      .eq('id', kycId)
      .single();
      
    if (fetchError) {
      console.error('❌ Error fetching KYC record before update:', fetchError);
      toast.dismiss(toastId);
      toast.error(`Failed to find KYC record: ${fetchError.message}`);
      return false;
    }
    
    if (!currentKyc) {
      console.error(`❌ KYC record with ID ${kycId} not found`);
      toast.dismiss(toastId);
      toast.error(`KYC record not found`);
      return false;
    }
    
    console.log('📄 Current KYC record before update:', currentKyc);
    
    // Enhanced error handling and detailed logging
    console.log(`📤 Calling admin-operations edge function with action: processKyc, status: ${status}`);
    
    // Prepare payload for better debugging
    const payload = {
      action: 'processKyc',
      data: {
        kycId,
        status,
        rejectionReason: message
      }
    };
    
    console.log(`Request payload:`, payload);
    
    // Implement retry logic with a limited number of attempts
    const maxRetries = 2; // Limiting to prevent too many retries
    let currentRetry = 0;
    let success = false;
    let lastError: Error | null = null;
    
    while (currentRetry <= maxRetries && !success) {
      try {
        // Update retry counter in UI if available
        if (typeof (window as any).kycRetryListener === 'function') {
          (window as any).kycRetryListener(currentRetry, maxRetries);
        }
        
        console.log(`Attempt ${currentRetry + 1}/${maxRetries + 1}: Processing KYC verification`);
        
        const response = await supabase.functions.invoke('admin-operations', {
          body: payload
        });
        
        console.log('📥 Full response from admin-operations function:', response);
        
        if (response.error) {
          console.error(`❌ Error from admin-operations function (attempt ${currentRetry + 1}):`, response.error);
          lastError = new Error(response.error.message || 'Error from admin-operations function');
          currentRetry++;
          continue;
        }
        
        // Check if the response contains an error object
        if (response.data && response.data.error) {
          console.error(`❌ Error from admin-operations response (attempt ${currentRetry + 1}):`, response.data.error);
          lastError = new Error(response.data.error.message || 'Unknown error from server');
          currentRetry++;
          continue;
        }
        
        // Handle case where response has no data
        if (!response.data) {
          console.error(`❌ No data returned from admin-operations function (attempt ${currentRetry + 1})`);
          lastError = new Error('No response data received');
          currentRetry++;
          continue;
        }
        
        // If we reach here without continuing to the next iteration, the operation was successful
        console.log(`✅ Successfully processed KYC verification with status: ${status}`, response.data);
        success = true;
        break;
      } catch (attemptError) {
        console.error(`❌ Exception during attempt ${currentRetry + 1}:`, attemptError);
        lastError = attemptError as Error;
        currentRetry++;
      }
      
      // Small delay between retries
      if (currentRetry <= maxRetries && !success) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // Clear the retry listener
    if (typeof (window as any).kycRetryListener === 'function') {
      (window as any).kycRetryListener(null, null);
    }
    
    // Handle the final result
    if (success) {
      // Trigger a refresh of KYC data immediately
      try {
        console.log('🔄 Triggering immediate fetch of KYC data after update');
        const { data: refreshData, error: refreshError } = await supabase
          .from('kyc_verifications')
          .select('*')
          .eq('id', kycId)
          .single();
          
        if (refreshData) {
          console.log('✅ Verified KYC update with fresh data:', refreshData);
          console.log(`✅ Current KYC status is now: ${refreshData.status}`);
        } else if (refreshError) {
          console.error('❌ Error verifying KYC update:', refreshError);
        }
      } catch (refreshErr) {
        console.error('❌ Exception during verification refresh:', refreshErr);
      }
      
      // Dismiss the loading toast and show success
      toast.dismiss(toastId);
      toast.success(`KYC verification ${status === 'approved' ? 'approved' : 
        status === 'rejected' ? 'rejected' : 'updated'} successfully.`, {
        duration: 5000
      });
      
      return true;
    } else {
      // Failed after all retry attempts
      toast.dismiss(toastId);
      toast.error(`Failed to process KYC verification after multiple attempts: ${lastError?.message || 'Unknown error'}`, {
        duration: 5000
      });
      
      return false;
    }
  } catch (error) {
    console.error('❌ Error processing KYC verification:', error);
    toast.error(`An error occurred while processing KYC verification: ${(error as Error).message}`, {
      duration: 5000
    });
    return false;
  }
};


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
    
    if (!kycId) {
      toast.error('KYC ID is required');
      return false;
    }
    
    // Add debug toast to track the start of the process with a unique ID
    const toastId = `process-kyc-${kycId}-${Date.now()}`;
    toast.loading(`Processing KYC verification (${status})...`, {
      id: toastId,
      duration: 15000 // Longer duration to ensure it stays visible during processing
    });
    
    // Verify admin permissions with improved error handling
    try {
      if (!await verifyAdminPermissions()) {
        toast.dismiss(toastId);
        toast.error('You do not have admin permissions to process KYC verifications');
        return false;
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
    
    // Implement retry logic
    const result = await executeWithRetries(async () => {
      console.log(`Current time before request: ${new Date().toISOString()}`);
      
      const response = await supabase.functions.invoke('admin-operations', {
        body: payload
      });
      
      console.log('📥 Full response from admin-operations function:', JSON.stringify(response, null, 2));
      
      if (response.error) {
        console.error('❌ Error from admin-operations function:', response.error);
        throw response.error;
      }
      
      const data = response.data;
      
      // Check if the response contains an error object
      if (data && data.error) {
        console.error('❌ Error from admin-operations response:', data.error);
        throw new Error(data.error.message || 'Unknown error from server');
      }
      
      // Handle case where response has no data
      if (!data) {
        console.error('❌ No data returned from admin-operations function');
        throw new Error('No response data received');
      }
      
      // Handle case where response has error in data
      if (data.error) {
        console.error('❌ Error in admin-operations response data:', data.error);
        throw new Error(data.error.message || 'Error from server');
      }
      
      if (!data.kyc) {
        console.error('❌ Invalid response from admin-operations function:', data);
        throw new Error('Invalid response from server');
      }
      
      // Double-check the status from the response
      const returnedStatus = data.kyc.status;
      if (returnedStatus !== status) {
        console.error(`❌ Status mismatch! Requested: ${status}, Received: ${returnedStatus}`);
        throw new Error(`Status mismatch: Requested ${status}, Received ${returnedStatus}`);
      }
      
      // If we reach here, the operation was successful
      console.log(`✅ Successfully processed KYC verification with status: ${status}`, data);
      return data;
    }, toastId);
    
    if (!result.success) {
      return false;
    }
    
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
    
    // Clear the retry listener
    if (typeof (window as any).kycRetryListener === 'function') {
      (window as any).kycRetryListener(null, 3);
    }
    
    // Dismiss the loading toast and show success
    toast.dismiss(toastId);
    toast.success(`KYC verification ${status === 'approved' ? 'approved' : 
      status === 'rejected' ? 'rejected' : 'updated'} successfully.`, {
      duration: 5000
    });
    
    return true;
  } catch (error) {
    console.error('❌ Error processing KYC verification:', error);
    toast.error(`An error occurred while processing KYC verification: ${(error as Error).message}`, {
      duration: 5000
    });
    return false;
  }
};

/**
 * Execute a function with retry logic
 */
async function executeWithRetries<T>(
  fn: () => Promise<T>,
  toastId: string,
  maxRetries: number = 3
): Promise<{success: boolean, data?: T}> {
  let retryCount = 0;
  let success = false;
  let lastError = null;
  let response = null;
  
  while (retryCount < maxRetries && !success) {
    try {
      console.log(`🔄 Attempt ${retryCount + 1} of ${maxRetries}`);
      
      // Trigger the retry listener if it exists
      if (typeof (window as any).kycRetryListener === 'function') {
        (window as any).kycRetryListener(retryCount + 1, maxRetries);
      }
      
      // Give a small delay before each retry attempt after the first
      if (retryCount > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      response = await fn();
      success = true;
      
      return { success: true, data: response };
    } catch (invokeError) {
      console.error('❌ Exception during operation:', invokeError);
      lastError = invokeError;
      retryCount++;
      
      if (retryCount >= maxRetries) {
        break;
      }
      
      console.log(`Retrying in 1 second... (attempt ${retryCount + 1})`);
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait before retry
    }
  }
  
  // After all retries, check if we were successful
  if (!success) {
    console.error('❌ All retry attempts failed:', lastError);
    toast.dismiss(toastId);
    toast.error(`Failed to update KYC verification after ${maxRetries} attempts: ${lastError?.message || 'Unknown error'}`, {
      duration: 5000
    });
    return { success: false };
  }
  
  return { success: true, data: response };
}

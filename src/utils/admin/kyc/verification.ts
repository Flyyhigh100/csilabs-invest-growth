
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Process KYC verification - approve, reject, or request clarification
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
      duration: 10000 // Longer duration to ensure it stays visible during processing
    });
    
    // Enhanced error handling and detailed logging
    console.log(`📤 Calling admin-operations edge function with action: processKyc, status: ${status}`);
    console.log(`Request payload:`, { kycId, status, rejectionReason: message });
    
    // Add additional context for debugging
    console.log(`Current time before request: ${new Date().toISOString()}`);
    
    try {
      const response = await supabase.functions.invoke('admin-operations', {
        body: {
          action: 'processKyc',
          data: {
            kycId,
            status,
            rejectionReason: message
          }
        }
      });
      
      console.log('📥 Response from admin-operations function:', JSON.stringify(response, null, 2));
      
      if (response.error) {
        console.error('❌ Error from admin-operations function:', response.error);
        toast.dismiss(toastId);
        toast.error(`Failed to update KYC verification: ${response.error.message}`, {
          duration: 5000
        });
        return false;
      }
      
      const data = response.data;
      
      // Handle case where response has no data
      if (!data) {
        console.error('❌ No data returned from admin-operations function');
        toast.dismiss(toastId);
        toast.error('Failed to update KYC verification: No response data received', {
          duration: 5000
        });
        return false;
      }
      
      // Handle case where response has error in data
      if (data.error) {
        console.error('❌ Error in admin-operations response data:', data.error);
        toast.dismiss(toastId);
        toast.error(`Failed to update KYC verification: ${data.error.message || 'Unknown error'}`, {
          duration: 5000
        });
        return false;
      }
      
      if (!data.kyc) {
        console.error('❌ Invalid response from admin-operations function:', data);
        toast.dismiss(toastId);
        toast.error('Failed to update KYC verification: Invalid response from server', {
          duration: 5000
        });
        return false;
      }
      
      // Double-check the status from the response
      const returnedStatus = data.kyc.status;
      if (returnedStatus !== status) {
        console.error(`❌ Status mismatch! Requested: ${status}, Received: ${returnedStatus}`);
        toast.dismiss(toastId);
        toast.error(`Status mismatch in KYC verification. Please try again.`, {
          duration: 5000
        });
        return false;
      }
      
      // Log the successful update
      console.log(`✅ Successfully processed KYC verification with status: ${status}`, data);
      
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
    } catch (invokeError) {
      console.error('❌ Exception during edge function invocation:', invokeError);
      toast.dismiss(toastId);
      toast.error(`Error communicating with the server: ${(invokeError as Error).message}`, {
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

// Request clarification from user
export const requestKycClarification = async (
  kycId: string,
  message: string
): Promise<boolean> => {
  if (!message || message.trim() === '') {
    toast.error('Please provide a clarification message');
    return false;
  }
  
  console.log('🔍 Requesting clarification with message:', message);
  
  const toastId = `clarify-kyc-${kycId}-${Date.now()}`;
  toast.loading(`Sending clarification request...`, {
    id: toastId,
    duration: 10000
  });
  
  try {
    // Use direct call to process with needs_clarification status
    console.log(`📤 Sending clarification request to Supabase for KYC ID: ${kycId}`);
    
    const response = await supabase.functions.invoke('admin-operations', {
      body: {
        action: 'requestKycClarification',
        data: {
          kycId,
          message: message.trim()
        }
      }
    });
    
    console.log('📥 Response from clarification request:', JSON.stringify(response, null, 2));
    
    if (response.error) {
      console.error('❌ Error from clarification request:', response.error);
      toast.dismiss(toastId);
      toast.error(`Failed to request clarification: ${response.error.message}`, {
        duration: 5000
      });
      return false;
    }
    
    // Verify the update went through
    try {
      console.log('🔄 Verifying clarification update with fresh data fetch');
      const { data: refreshData, error: refreshError } = await supabase
        .from('kyc_verifications')
        .select('*')
        .eq('id', kycId)
        .single();
        
      if (refreshData) {
        console.log('✅ Verified clarification update with fresh data:', refreshData);
        console.log(`✅ Current KYC status is now: ${refreshData.status}`);
        console.log(`✅ Clarification message is: ${refreshData.clarification_message}`);
      } else if (refreshError) {
        console.error('❌ Error verifying clarification update:', refreshError);
      }
    } catch (refreshErr) {
      console.error('❌ Exception during verification refresh:', refreshErr);
    }
    
    toast.dismiss(toastId);
    toast.success('Clarification request sent successfully', { duration: 5000 });
    return true;
  } catch (error) {
    console.error('❌ Error sending clarification request:', error);
    toast.dismiss(toastId);
    toast.error(`Failed to send clarification request: ${(error as Error).message}`, { 
      duration: 5000 
    });
    return false;
  }
};

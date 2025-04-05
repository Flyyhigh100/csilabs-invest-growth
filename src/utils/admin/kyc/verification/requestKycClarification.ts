
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { executeWithRetries } from './retryUtils';

/**
 * Request clarification from user
 */
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
    
    const result = await executeWithRetries(async () => {
      const payload = {
        action: 'requestKycClarification',
        data: {
          kycId,
          message: message.trim()
        }
      };
      
      console.log('Request payload for clarification:', payload);
      
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
      
      // Check if kyc object is present and has the expected status
      if (!data.kyc || data.kyc.status !== 'needs_clarification') {
        console.error('❌ Invalid response from server:', data);
        throw new Error(`Invalid server response: ${JSON.stringify(data)}`);
      }
      
      // If we get here, the operation was successful
      console.log('✅ Clarification request successful:', data);
      return data;
    }, toastId);
    
    if (!result.success) {
      return false;
    }
    
    // Verify the update went through
    try {
      console.log('🔄 Verifying clarification update with fresh data fetch');
      const { data: refreshData, error: refreshError } = await supabase
        .from("kyc_verifications")
        .select("*")
        .eq("id", kycId)
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
  } finally {
    // Clear the retry listener
    if (typeof (window as any).kycRetryListener === 'function') {
      (window as any).kycRetryListener(null, 3);
    }
  }
};

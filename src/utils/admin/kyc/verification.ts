
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Process KYC verification - approve, reject, or request clarification
export const processKycVerification = async (
  kycId: string, 
  status: 'approved' | 'rejected' | 'needs_clarification',
  message?: string
): Promise<boolean> => {
  try {
    console.log(`Processing KYC verification ${kycId} with status: ${status}, message: ${message || 'none'}`);
    
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
    
    // Use the edge function to process the KYC verification
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
    
    console.log('Response from admin-operations function:', response);
    
    if (response.error) {
      console.error('Error from admin-operations function:', response.error);
      toast.dismiss(toastId);
      toast.error(`Failed to update KYC verification: ${response.error.message}`, {
        duration: 5000
      });
      return false;
    }
    
    const data = response.data;
    
    if (!data || !data.kyc) {
      console.error('Invalid response from admin-operations function:', data);
      toast.dismiss(toastId);
      toast.error('Failed to update KYC verification: Invalid response from server', {
        duration: 5000
      });
      return false;
    }
    
    // Log the successful update
    console.log(`Successfully processed KYC verification with status: ${status}`, data);
    
    // Dismiss the loading toast and show success
    toast.dismiss(toastId);
    toast.success(`KYC verification ${status} successfully.`, {
      duration: 5000
    });
    
    return true;
  } catch (error) {
    console.error('Error processing KYC verification:', error);
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
  
  console.log('Requesting clarification with message:', message);
  return processKycVerification(kycId, 'needs_clarification', message);
};


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
      toast.error(`Failed to update KYC verification: ${response.error.message}`);
      return false;
    }
    
    const data = response.data;
    
    if (!data || !data.kyc) {
      console.error('Invalid response from admin-operations function:', data);
      toast.error('Failed to update KYC verification: Invalid response from server');
      return false;
    }
    
    // Log status change 
    const previousStatus = data.previousStatus || 'unknown';
    console.log(`Successfully processed KYC verification: ${previousStatus} -> ${status}`, data);
    
    // If we had a status change, provide a clear confirmation message
    const statusMap = {
      'approved': 'approved',
      'rejected': 'rejected',
      'needs_clarification': 'sent for clarification'
    };
    
    const statusText = statusMap[status] || status;
    toast.success(`KYC verification successfully ${statusText}`);
    
    return true;
  } catch (error) {
    console.error('Error processing KYC verification:', error);
    toast.error(`An error occurred while processing KYC verification: ${(error as Error).message}`);
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
  
  return processKycVerification(kycId, 'needs_clarification', message);
};

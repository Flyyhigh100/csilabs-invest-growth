
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
    const { data, error } = await supabase.functions.invoke('admin-operations', {
      body: {
        action: 'processKyc',
        data: {
          kycId,
          status,
          rejectionReason: message
        }
      }
    });
    
    if (error) {
      console.error('Error from admin-operations function:', error);
      toast.error(`Failed to update KYC verification: ${error.message}`);
      return false;
    }
    
    if (!data || !data.kyc) {
      console.error('Invalid response from admin-operations function:', data);
      toast.error('Failed to update KYC verification: Invalid response from server');
      return false;
    }
    
    console.log(`Successfully processed KYC verification with status: ${status}`, data);
    toast.success(`KYC verification ${status === 'approved' ? 'approved' : status === 'rejected' ? 'rejected' : 'sent for clarification'}`);
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

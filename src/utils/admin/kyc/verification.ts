
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Process KYC verification - approve, reject, or request clarification
export const processKycVerification = async (
  kycId: string, 
  status: 'approved' | 'rejected' | 'needs_clarification',
  message?: string
): Promise<boolean> => {
  try {
    console.log(`Processing KYC verification ${kycId} with status: ${status}`);
    
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
      toast.error('Failed to update KYC verification');
      return false;
    }
    
    console.log(`Successfully processed KYC verification with status: ${status}`, data);
    toast.success(`KYC verification ${status}`);
    return true;
  } catch (error) {
    console.error('Error processing KYC verification:', error);
    toast.error('An error occurred while processing KYC verification');
    return false;
  }
};

// Request clarification from user
export const requestKycClarification = async (
  kycId: string,
  message: string
): Promise<boolean> => {
  return processKycVerification(kycId, 'needs_clarification', message);
};

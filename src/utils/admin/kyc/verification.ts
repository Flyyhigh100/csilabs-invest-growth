
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
    
    const updateData: any = {
      status,
      reviewed_at: new Date().toISOString(),
    };
    
    if (status === 'rejected' && message) {
      updateData.rejection_reason = message;
    } else if (status === 'approved') {
      updateData.rejection_reason = null;
      updateData.clarification_message = null;
    }
    
    const { error, data } = await supabase
      .from('kyc_verifications')
      .update(updateData)
      .eq('id', kycId)
      .select();
    
    if (error) {
      console.error('Error updating KYC verification:', error);
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
  try {
    console.log(`Requesting clarification for KYC ${kycId}: ${message}`);
    
    const updateData = {
      clarification_message: message,
      reviewed_at: new Date().toISOString(),
    };
    
    const { error, data } = await supabase
      .from('kyc_verifications')
      .update(updateData)
      .eq('id', kycId)
      .select();
    
    if (error) {
      console.error('Error requesting clarification:', error);
      toast.error('Failed to send clarification request');
      return false;
    }
    
    console.log('Clarification request sent successfully:', data);
    toast.success('Clarification request sent');
    return true;
  } catch (error) {
    console.error('Error requesting clarification:', error);
    toast.error('An error occurred while requesting clarification');
    return false;
  }
};

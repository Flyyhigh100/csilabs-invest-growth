
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
    
    // Add additional fields based on status
    if (status === 'approved') {
      updateData.approved_at = new Date().toISOString();
      updateData.approved_by = (await supabase.auth.getUser()).data.user?.id;
      updateData.rejection_reason = null;
      updateData.clarification_message = null;
    } else if (status === 'rejected' && message) {
      updateData.rejection_reason = message;
      updateData.approved_at = null;
      updateData.approved_by = null;
    } else if (status === 'needs_clarification' && message) {
      updateData.clarification_message = message;
      updateData.approved_at = null;
      updateData.approved_by = null;
    }
    
    // Debug log the update data
    console.log('Updating KYC verification with data:', updateData);
    
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
    
    return processKycVerification(kycId, 'needs_clarification', message);
  } catch (error) {
    console.error('Error requesting clarification:', error);
    toast.error('An error occurred while requesting clarification');
    return false;
  }
};

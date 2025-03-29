
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const isUserAdmin = async (): Promise<boolean> => {
  try {
    // Get current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Error getting session:', sessionError);
      return false;
    }
    
    if (!session || !session.user) {
      console.log('No active session or user found');
      return false;
    }
    
    console.log('Checking admin status for user ID:', session.user.id);
    
    // Check if user exists in admins table
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .eq('id', session.user.id);
    
    if (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
    
    const isAdmin = Array.isArray(data) && data.length > 0;
    console.log('Admin check result:', isAdmin, 'Data:', data);
    
    // Also check by email as fallback
    if (!isAdmin && session.user.email) {
      const { data: emailData, error: emailError } = await supabase
        .from('admins')
        .select('*')
        .eq('email', session.user.email);
      
      if (emailError) {
        console.error('Error checking admin by email:', emailError);
      } else {
        const isAdminByEmail = Array.isArray(emailData) && emailData.length > 0;
        console.log('Admin check by email result:', isAdminByEmail, 'Data:', emailData);
        return isAdminByEmail;
      }
    }
    
    return isAdmin;
  } catch (error) {
    console.error('Exception checking admin status:', error);
    return false;
  }
};

export const processKycVerification = async (
  kycId: string, 
  status: 'approved' | 'rejected', 
  rejectionReason?: string
): Promise<boolean> => {
  try {
    const updateData: any = {
      status,
      reviewed_at: new Date().toISOString(),
    };
    
    if (status === 'rejected' && rejectionReason) {
      updateData.rejection_reason = rejectionReason;
    } else if (status === 'approved') {
      updateData.rejection_reason = null;
    }
    
    const { error } = await supabase
      .from('kyc_verifications')
      .update(updateData)
      .eq('id', kycId);
    
    if (error) {
      console.error('Error updating KYC verification:', error);
      toast.error('Failed to update KYC verification');
      return false;
    }
    
    toast.success(`KYC verification ${status}`);
    return true;
  } catch (error) {
    console.error('Error processing KYC verification:', error);
    toast.error('An error occurred while processing KYC verification');
    return false;
  }
};

export const markTokensAsSent = async (
  transactionId: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('transactions')
      .update({
        token_sent: true,
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', transactionId);
    
    if (error) {
      console.error('Error marking tokens as sent:', error);
      toast.error('Failed to update transaction');
      return false;
    }
    
    toast.success('Transaction updated successfully');
    return true;
  } catch (error) {
    console.error('Error marking tokens as sent:', error);
    toast.error('An error occurred while updating transaction');
    return false;
  }
};

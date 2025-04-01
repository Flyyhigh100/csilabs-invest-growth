
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Mark tokens as sent for completed transactions
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

// Approve high-value transaction
export const approveTransaction = async (
  transactionId: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('transactions')
      .update({
        approval_status: 'approved',
        updated_at: new Date().toISOString()
      })
      .eq('id', transactionId);
    
    if (error) {
      console.error('Error approving transaction:', error);
      toast.error('Failed to approve transaction');
      return false;
    }
    
    toast.success('Transaction approved successfully');
    
    // Now proceed with creating the actual payment
    // This is where we would call the CoinPayments API to create the transaction
    // For now, we'll just update the status to indicate it's been approved
    
    return true;
  } catch (error) {
    console.error('Error approving transaction:', error);
    toast.error('An error occurred while approving transaction');
    return false;
  }
};

// Reject high-value transaction
export const rejectTransaction = async (
  transactionId: string,
  reason: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('transactions')
      .update({
        approval_status: 'rejected',
        admin_notes: reason,
        status: 'failed',
        updated_at: new Date().toISOString()
      })
      .eq('id', transactionId);
    
    if (error) {
      console.error('Error rejecting transaction:', error);
      toast.error('Failed to reject transaction');
      return false;
    }
    
    toast.success('Transaction rejected successfully');
    return true;
  } catch (error) {
    console.error('Error rejecting transaction:', error);
    toast.error('An error occurred while rejecting transaction');
    return false;
  }
};

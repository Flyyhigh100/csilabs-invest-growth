
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Approve a direct crypto payment
 */
export const approveDirectCryptoPayment = async (transactionId: string, blockchainTxId?: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('transactions')
      .update({
        status: 'confirmed',
        blockchain_tx_id: blockchainTxId || null,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', transactionId);

    if (error) {
      console.error('Error approving direct crypto payment:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Failed to approve direct crypto payment:', error);
    return false;
  }
};

/**
 * Reject a direct crypto payment
 */
export const rejectDirectCryptoPayment = async (transactionId: string, reason?: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('transactions')
      .update({
        status: 'failed',
        admin_notes: reason || 'Payment rejected by admin',
        updated_at: new Date().toISOString()
      })
      .eq('id', transactionId);

    if (error) {
      console.error('Error rejecting direct crypto payment:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Failed to reject direct crypto payment:', error);
    return false;
  }
};

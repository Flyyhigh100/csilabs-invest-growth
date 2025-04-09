
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * Marks tokens as sent and adds the blockchain transaction ID
 */
export const markTokensAsSent = async (transactionId: string, blockchainTxId: string) => {
  try {
    const { data, error } = await supabase.functions.invoke('admin-operations', {
      body: { 
        action: 'markTokensSent', 
        transactionId,
        blockchainTxId
      },
    });

    if (error) {
      toast.error(`Failed to update transaction: ${error.message}`);
      throw error;
    }

    toast.success('Transaction updated successfully');
    return data.transaction;
  } catch (err) {
    console.error('Error updating transaction:', err);
    throw err;
  }
};

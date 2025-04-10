
import { supabase } from '@/integrations/supabase/client';

export const markTokensAsSent = async (transactionId: string, blockchainTxId: string) => {
  const { error } = await supabase
    .from('transactions')
    .update({
      token_sent: true,
      blockchain_tx_id: blockchainTxId,
      updated_at: new Date().toISOString()
    })
    .eq('id', transactionId);

  if (error) {
    console.error('Error marking tokens as sent:', error);
    throw error;
  }

  return true;
};

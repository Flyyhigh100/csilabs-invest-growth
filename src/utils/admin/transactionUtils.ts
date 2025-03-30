
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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

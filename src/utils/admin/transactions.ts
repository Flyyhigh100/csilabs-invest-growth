
import { supabase } from '@/integrations/supabase/client';

export const markTokensAsSent = async (transactionId: string, blockchainTxId: string) => {
  console.log(`Frontend: Calling admin-operations edge function to mark transaction ${transactionId} as sent with blockchain TX: ${blockchainTxId}`);
  
  try {
    // Call the admin-operations edge function instead of direct database update
    const { data, error } = await supabase.functions.invoke('admin-operations', {
      body: {
        action: 'markTokensSent',
        data: {
          transactionId,
          blockchainTxId
        }
      }
    });

    if (error) {
      console.error('Error calling admin-operations function:', error);
      throw error;
    }

    if (data?.error) {
      console.error('Admin operations returned error:', data.error);
      throw new Error(data.error.message || 'Failed to mark tokens as sent');
    }

    console.log('Successfully marked tokens as sent via admin-operations:', data);
    return true;
  } catch (error) {
    console.error('Error marking tokens as sent:', error);
    throw error;
  }
};

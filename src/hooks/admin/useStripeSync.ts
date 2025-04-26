
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Transaction } from '@/types/transactions';

export function useStripeSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  
  const syncTransaction = async (transaction: Transaction): Promise<Transaction | null> => {
    if (!transaction || !transaction.id) {
      toast.error('Invalid transaction');
      return null;
    }
    
    if (transaction.payment_method !== 'stripe') {
      toast.info('This is not a Stripe transaction', {
        description: 'Only Stripe transactions can be synced'
      });
      return null;
    }

    try {
      setIsSyncing(true);
      
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: {
          action: 'syncStripePaymentStatus',
          data: {
            transactionId: transaction.id
          }
        }
      });
      
      if (error) {
        console.error('Error syncing with Stripe:', error);
        toast.error('Failed to sync with Stripe');
        return null;
      }
      
      if (data.error) {
        console.error('Error response from sync operation:', data.error);
        toast.error(data.error.message || 'Error syncing payment');
        return null;
      }
      
      if (data.success) {
        toast.success('Payment status synced successfully');
        return data.transaction;
      } else {
        toast.info(data.message || 'No changes needed');
        return transaction;
      }
    } catch (err) {
      console.error('Exception in syncTransaction:', err);
      toast.error('Error syncing with Stripe');
      return null;
    } finally {
      setIsSyncing(false);
    }
  };
  
  return {
    syncTransaction,
    isSyncing
  };
}

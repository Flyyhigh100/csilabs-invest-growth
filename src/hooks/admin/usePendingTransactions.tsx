
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@/types/transactions';

// Extended transaction type with profile information
export interface PendingTransactionWithProfile extends Transaction {
  profiles?: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  } | null;
  crypto_currency?: string;
  crypto_amount?: number;
}

export const usePendingTransactions = () => {
  return useQuery({
    queryKey: ['admin', 'pending-transactions'],
    queryFn: async (): Promise<PendingTransactionWithProfile[]> => {
      console.info('Fetching pending transactions with profiles...');
      
      // Fetch transactions that are completed but tokens not sent yet
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select(`
          *,
          profiles:user_id(
            first_name,
            last_name,
            email
          )
        `)
        .eq('status', 'completed')
        .is('token_sent', false)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching pending transactions:', error);
        throw error;
      }
      
      console.info('Found', transactions?.length, 'pending transactions');
      console.info('Processed transaction data:', transactions);
      
      // Safely cast the data to ensure type compatibility
      const safeTransactions = transactions?.map(tx => {
        // Check if profiles exists and is a valid object without error flag
        if (tx.profiles && 
            typeof tx.profiles === 'object' && 
            !('error' in tx.profiles)) {
          return tx as PendingTransactionWithProfile;
        } else {
          // If profiles is an error, null, or invalid, set it to null
          return {
            ...tx,
            profiles: null
          } as unknown as PendingTransactionWithProfile;
        }
      }) || [];
      
      return safeTransactions;
    },
  });
};

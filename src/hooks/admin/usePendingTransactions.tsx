
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@/types/transactions';

interface PendingTransactionWithProfile extends Transaction {
  profiles: {
    email: string | null;
    first_name: string | null;
    last_name: string | null;
  } | null;
}

export const usePendingTransactions = () => {
  return useQuery({
    queryKey: ['admin-pending-transactions'],
    queryFn: async () => {
      console.log('Fetching pending transactions with profiles...');
      
      try {
        // First, let's query the transactions
        const { data: transactions, error: txError } = await supabase
          .from('transactions')
          .select('*')
          .eq('token_sent', false)
          .eq('status', 'completed')
          .order('created_at', { ascending: false });

        if (txError) {
          console.error('Error fetching pending transactions:', txError);
          throw txError;
        }
        
        // If we have transactions, fetch profiles separately to avoid join issues
        const processedTransactions: PendingTransactionWithProfile[] = [];
        
        if (transactions && transactions.length > 0) {
          console.log(`Found ${transactions.length} pending transactions`);
          
          // For each transaction, get the associated profile
          for (const tx of transactions) {
            // Fetch the profile for this transaction's user_id
            const { data: profileData } = await supabase
              .from('profiles')
              .select('email, first_name, last_name')
              .eq('id', tx.user_id)
              .single();
              
            // Add to our processed array with properly typed profile data
            processedTransactions.push({
              ...tx,
              profiles: profileData || null
            });
          }
        }
        
        console.log('Processed transaction data:', processedTransactions);
        return processedTransactions;
      } catch (err) {
        console.error('Exception in pendingTransactions query:', err);
        throw err;
      }
    },
    refetchInterval: 30000, // Refetch every 30 seconds
    refetchOnWindowFocus: true,
  });
};

export type { PendingTransactionWithProfile };

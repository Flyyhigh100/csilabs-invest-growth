
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@/types/transactions';

interface PendingTransactionWithProfile extends Transaction {
  profiles: {
    email: string;
    first_name: string;
    last_name: string;
  } | null;
}

export const usePendingTransactions = () => {
  return useQuery({
    queryKey: ['admin-pending-transactions'],
    queryFn: async () => {
      // First, let's check if the join works with a simpler query
      console.log('Fetching pending transactions with profiles...');
      
      try {
        const { data, error } = await supabase
          .from('transactions')
          .select(`
            *,
            profiles:user_id(
              email,
              first_name,
              last_name
            )
          `)
          .eq('token_sent', false)
          .eq('status', 'completed')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching pending transactions:', error);
          throw error;
        }
        
        console.log('Raw transaction data:', data);
        
        // Process the data to ensure profiles is properly handled
        const processedData = data.map(item => {
          console.log('Processing transaction item:', item);
          
          return {
            ...item,
            profiles: item.profiles || null
          } as PendingTransactionWithProfile;
        });
        
        console.log('Processed transaction data:', processedData);
        return processedData;
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

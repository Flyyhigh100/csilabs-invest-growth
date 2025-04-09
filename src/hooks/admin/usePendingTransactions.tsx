
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@/types/transactions';

interface PendingTransactionWithProfile extends Transaction {
  profiles: {
    email: string;
    first_name: string;
    last_name: string;
  };
}

export const usePendingTransactions = () => {
  return useQuery({
    queryKey: ['admin-pending-transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          profiles:user_id (
            email,
            first_name,
            last_name
          )
        `)
        .eq('token_sent', false)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Cast the data to ensure it matches our expected type
      return (data as unknown) as PendingTransactionWithProfile[];
    }
  });
};

export type { PendingTransactionWithProfile };

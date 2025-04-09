
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
      
      // Process the data to ensure profiles is properly handled
      const processedData = data.map(item => {
        // Handle case where profiles might be a SelectQueryError
        if (item.profiles && typeof item.profiles === 'object' && !('error' in item.profiles)) {
          return item as PendingTransactionWithProfile;
        }
        
        // If profiles has an error or is invalid, set it to null
        return {
          ...item,
          profiles: null
        } as PendingTransactionWithProfile;
      });
      
      return processedData;
    }
  });
};

export type { PendingTransactionWithProfile };

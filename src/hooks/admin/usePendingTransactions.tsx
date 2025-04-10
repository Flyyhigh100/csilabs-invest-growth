
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
          profiles(
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
        // First check if profiles exists at all
        if (!item.profiles) {
          return {
            ...item,
            profiles: null
          } as PendingTransactionWithProfile;
        }
        
        // Now we know profiles is not null
        // Check if profiles is an array with data
        if (Array.isArray(item.profiles)) {
          return {
            ...item,
            profiles: item.profiles.length > 0 ? item.profiles[0] : null
          } as PendingTransactionWithProfile;
        }
        
        // If profiles is null or invalid, set it to null
        return {
          ...item,
          profiles: (typeof item.profiles === 'object') ? item.profiles : null
        } as PendingTransactionWithProfile;
      });
      
      return processedData;
    }
  });
};

export type { PendingTransactionWithProfile };

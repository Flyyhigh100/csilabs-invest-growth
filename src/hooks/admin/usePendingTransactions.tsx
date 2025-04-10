
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
        // Check if profiles exists and is a valid array/object
        if (item.profiles && typeof item.profiles === 'object') {
          // If profiles is an array with data, get first item (should be only one)
          if (Array.isArray(item.profiles) && item.profiles.length > 0) {
            return {
              ...item,
              profiles: item.profiles[0] || null
            } as PendingTransactionWithProfile;
          }
          
          // If profiles is already an object (not an array), keep it as is
          return {
            ...item,
            profiles: item.profiles || null
          } as PendingTransactionWithProfile;
        }
        
        // If profiles is null or invalid, set it to null
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

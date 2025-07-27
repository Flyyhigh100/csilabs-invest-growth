
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@/types/transactions';
import { useState } from 'react';
import { useTransactionRealtime } from '@/hooks/realtime/useTransactionRealtime';

export const useTransactions = (userId: string | undefined) => {
  const queryClient = useQueryClient();
  const [forceRefreshCounter, setForceRefreshCounter] = useState(0);
  
  // Use the unified realtime hook for transactions
  useTransactionRealtime(userId);

  // Force refresh function that can be called from outside
  const forceRefresh = () => {
    console.log('Forcing transactions refresh');
    setForceRefreshCounter(prev => prev + 1);
    queryClient.invalidateQueries({ queryKey: ['transactions', userId] });
  };

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['transactions', userId, forceRefreshCounter],
    queryFn: async () => {
      if (!userId) return [];
      
      console.log(`Fetching transactions for user ${userId}`);
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching transactions:', error);
        throw error;
      }
      
      console.log(`Fetched ${data?.length || 0} transactions`);
      return data;
    },
    enabled: !!userId,
    staleTime: 15000, // 15 seconds, shorter stale time for more frequent refreshes
    refetchOnWindowFocus: true,
  });

  return {
    transactions: data || [],
    isLoading,
    error,
    refetch,
    isFetching,
    forceRefresh
  };
};

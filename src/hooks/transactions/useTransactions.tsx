
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@/types/transactions';
import { useEffect } from 'react';

export const useTransactions = (userId: string | undefined) => {
  const queryClient = useQueryClient();
  
  // Set up real-time subscription for transactions
  useEffect(() => {
    if (!userId) return;
    
    console.log('Setting up real-time subscription for transactions');
    
    const channel = supabase
      .channel('transactions-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'transactions',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        console.log('Received real-time transaction update:', payload);
        // Invalidate the query to trigger a refetch
        queryClient.invalidateQueries({ queryKey: ['transactions', userId] });
      })
      .subscribe();
      
    return () => {
      console.log('Removing real-time subscription for transactions');
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);

  return useQuery({
    queryKey: ['transactions', userId],
    queryFn: async () => {
      if (!userId) throw new Error('User not authenticated');
      
      console.log('Fetching transactions for user:', userId);
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching transactions:', error);
        throw error;
      }
      
      console.log('Fetched transactions:', data?.length || 0);
      return data as Transaction[];
    },
    enabled: !!userId,
    staleTime: 30000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: true, // Refetch when the window regains focus
    refetchOnMount: true, // Refetch when the component mounts
  });
};

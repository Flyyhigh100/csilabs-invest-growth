
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '@/types/transactions';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export const useTransactions = (userId: string | undefined) => {
  const queryClient = useQueryClient();
  const [forceRefreshCounter, setForceRefreshCounter] = useState(0);
  
  // Set up a more robust real-time subscription
  useEffect(() => {
    if (!userId) return;
    
    console.log(`Setting up real-time subscription for transactions of user: ${userId}`);
    
    const channel = supabase
      .channel('transactions-changes')
      .on(
        'postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'transactions',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('Transaction change detected:', payload.eventType, payload.new?.status, payload.old?.status);
          
          // Log detailed information about the change
          if (payload.eventType === 'UPDATE') {
            const oldData = payload.old as any;
            const newData = payload.new as any;
            
            if (oldData.status !== newData.status) {
              console.log(`Transaction status changed from ${oldData.status} to ${newData.status}`);
              
              // Show toast notification for status changes
              toast.info(`Transaction status updated: ${newData.status}`);
              
              // Force immediate invalidation and refetch
              queryClient.invalidateQueries({ queryKey: ['transactions', userId] });
            }
          }
          
          // For other events (INSERT, DELETE), also invalidate
          if (payload.eventType === 'INSERT' || payload.eventType === 'DELETE') {
            console.log(`Transaction ${payload.eventType.toLowerCase()} detected`);
            queryClient.invalidateQueries({ queryKey: ['transactions', userId] });
          }
        }
      )
      .subscribe((status) => {
        console.log(`Real-time subscription status for transactions: ${status}`);
        if (status === 'SUBSCRIBED') {
          console.log('Successfully subscribed to transaction changes');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Error subscribing to transaction changes');
        }
      });
      
    return () => {
      console.log('Cleaning up transactions real-time subscription');
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);

  // Force refresh function that can be called from outside
  const forceRefresh = () => {
    console.log('Forcing transactions refresh');
    setForceRefreshCounter(prev => prev + 1);
    queryClient.invalidateQueries({ queryKey: ['transactions', userId] });
  };

  const { data, isLoading, error, refetch } = useQuery({
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
    forceRefresh
  };
};

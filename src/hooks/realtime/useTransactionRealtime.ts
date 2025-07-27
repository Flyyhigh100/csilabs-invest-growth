import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useTransactionRealtime = (userId?: string, onUpdate?: () => void) => {
  const [isConnected, setIsConnected] = useState(false);
  const queryClient = useQueryClient();

  const invalidateTransactionQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['transactions'] });
    queryClient.invalidateQueries({ queryKey: ['analytics'] });
    queryClient.invalidateQueries({ queryKey: ['realtime-data'] });
    onUpdate?.();
  }, [queryClient, onUpdate]);

  useEffect(() => {
    const channel = supabase
      .channel('transaction-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          ...(userId && { filter: `user_id=eq.${userId}` })
        },
        (payload) => {
          console.log('Transaction realtime update:', payload);
          invalidateTransactionQueries();
          
          // Show toast for important transaction updates
          if (payload.eventType === 'UPDATE' && payload.new) {
            const transaction = payload.new as any;
            if (transaction.status === 'completed') {
              toast.success('Transaction completed', {
                description: `Transaction ${transaction.transaction_id} has been completed.`
              });
            }
          }
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
        if (status === 'SUBSCRIBED') {
          console.log('✅ Transaction realtime connected');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, invalidateTransactionQueries]);

  return { isConnected };
};
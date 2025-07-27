import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface RealtimeStatus {
  isConnected: boolean;
  lastUpdate: Date | null;
  connectionAttempts: number;
}

export const useTransactionRealtime = (userId?: string, onUpdate?: () => void) => {
  const [status, setStatus] = useState<RealtimeStatus>({
    isConnected: false,
    lastUpdate: null,
    connectionAttempts: 0
  });
  const queryClient = useQueryClient();

  const invalidateTransactionQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['transactions'] });
    queryClient.invalidateQueries({ queryKey: ['analytics'] });
    queryClient.invalidateQueries({ queryKey: ['realtime-data'] });
    onUpdate?.();
    
    setStatus(prev => ({ 
      ...prev, 
      lastUpdate: new Date() 
    }));
  }, [queryClient, onUpdate]);

  useEffect(() => {
    console.log('Setting up transaction realtime subscription...');
    
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
        console.log('Transaction realtime status:', status);
        
        setStatus(prev => ({
          ...prev,
          isConnected: status === 'SUBSCRIBED',
          connectionAttempts: prev.connectionAttempts + (status === 'CHANNEL_ERROR' ? 1 : 0)
        }));

        if (status === 'SUBSCRIBED') {
          console.log('Transaction realtime subscription established');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Failed to subscribe to transaction updates');
        }
      });

    return () => {
      console.log('Cleaning up transaction realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [userId, invalidateTransactionQueries]);

  return status;
};
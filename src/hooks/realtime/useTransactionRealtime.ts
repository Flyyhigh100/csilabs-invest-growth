import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface RealtimeStatus {
  isConnected: boolean;
  lastUpdate: Date | null;
  connectionAttempts: number;
  lastError: string | null;
  reconnectAttempts: number;
}

export const useTransactionRealtime = (userId?: string, onUpdate?: () => void) => {
  const [status, setStatus] = useState<RealtimeStatus>({
    isConnected: false,
    lastUpdate: null,
    connectionAttempts: 0,
    lastError: null,
    reconnectAttempts: 0
  });
  const queryClient = useQueryClient();
  const channelRef = useRef<any>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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

  const connectWithRetry = useCallback(async () => {
    try {
      // Clear any existing timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      // Remove existing channel if any
      if (channelRef.current) {
        console.log('Removing existing transaction channel...');
        await supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }

      console.log('Setting up transaction realtime subscription...');
      
      const channel = supabase
        .channel(`transaction-updates-${Date.now()}`, {
          config: {
            broadcast: { self: true },
            presence: { key: 'transaction-presence' }
          }
        })
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
          
          setStatus(prev => {
            const newStatus = {
              ...prev,
              isConnected: status === 'SUBSCRIBED',
              connectionAttempts: prev.connectionAttempts + (status === 'CHANNEL_ERROR' ? 1 : 0),
              lastError: status === 'CHANNEL_ERROR' ? 'Connection failed' : null,
              reconnectAttempts: status === 'SUBSCRIBED' ? 0 : prev.reconnectAttempts
            };

            if (status === 'SUBSCRIBED') {
              console.log('✅ Transaction realtime subscription established');
            } else if (status === 'CHANNEL_ERROR') {
              console.error('❌ Failed to subscribe to transaction updates');
              newStatus.lastError = 'Channel error - will retry';
              
              // Schedule retry with exponential backoff
              const retryDelay = Math.min(1000 * Math.pow(2, prev.reconnectAttempts), 30000);
              console.log(`Scheduling transaction retry in ${retryDelay}ms (attempt ${prev.reconnectAttempts + 1})`);
              
              reconnectTimeoutRef.current = setTimeout(() => {
                setStatus(s => ({ ...s, reconnectAttempts: s.reconnectAttempts + 1 }));
                connectWithRetry();
              }, retryDelay);
            } else if (status === 'CLOSED') {
              console.log('🔌 Transaction channel closed - attempting reconnect...');
              newStatus.lastError = 'Connection closed - reconnecting';
              
              // Immediate reconnect for CLOSED status
              reconnectTimeoutRef.current = setTimeout(() => {
                setStatus(s => ({ ...s, reconnectAttempts: s.reconnectAttempts + 1 }));
                connectWithRetry();
              }, 1000);
            }

            return newStatus;
          });
        });

      channelRef.current = channel;
      
    } catch (error) {
      console.error('Error setting up transaction realtime:', error);
      setStatus(prev => ({
        ...prev,
        lastError: error instanceof Error ? error.message : 'Unknown error',
        isConnected: false
      }));
    }
  }, [userId, invalidateTransactionQueries]);

  useEffect(() => {
    connectWithRetry();

    return () => {
      console.log('Cleaning up transaction realtime subscription');
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [connectWithRetry]);

  const manualReconnect = useCallback(() => {
    console.log('Manual reconnect requested for transactions');
    setStatus(prev => ({ ...prev, reconnectAttempts: 0, lastError: null }));
    connectWithRetry();
  }, [connectWithRetry]);

  return { ...status, manualReconnect };
};
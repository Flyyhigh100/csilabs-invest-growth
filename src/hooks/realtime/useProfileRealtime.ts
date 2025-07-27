import { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

interface RealtimeStatus {
  isConnected: boolean;
  lastUpdate: Date | null;
  connectionAttempts: number;
  lastError: string | null;
  reconnectAttempts: number;
}

export const useProfileRealtime = (onUpdate?: () => void) => {
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

  const invalidateProfileQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['profiles'] });
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
        console.log('Removing existing profile channel...');
        await supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }

      console.log('Setting up profile realtime subscription...');
      
      const channel = supabase
        .channel(`profile-updates-${Date.now()}`, {
          config: {
            broadcast: { self: true },
            presence: { key: 'profile-presence' }
          }
        })
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'profiles'
          },
          (payload) => {
            console.log('Profile realtime update:', payload);
            invalidateProfileQueries();
          }
        )
        .subscribe((status) => {
          console.log('Profile realtime status:', status);
          
          setStatus(prev => {
            const newStatus = {
              ...prev,
              isConnected: status === 'SUBSCRIBED',
              connectionAttempts: prev.connectionAttempts + (status === 'CHANNEL_ERROR' ? 1 : 0),
              lastError: status === 'CHANNEL_ERROR' ? 'Connection failed' : null,
              reconnectAttempts: status === 'SUBSCRIBED' ? 0 : prev.reconnectAttempts
            };

            if (status === 'SUBSCRIBED') {
              console.log('✅ Profile realtime subscription established');
            } else if (status === 'CHANNEL_ERROR') {
              console.error('❌ Failed to subscribe to profile updates');
              newStatus.lastError = 'Channel error - will retry';
              
              // Schedule retry with exponential backoff
              const retryDelay = Math.min(1000 * Math.pow(2, prev.reconnectAttempts), 30000);
              console.log(`Scheduling profile retry in ${retryDelay}ms (attempt ${prev.reconnectAttempts + 1})`);
              
              reconnectTimeoutRef.current = setTimeout(() => {
                setStatus(s => ({ ...s, reconnectAttempts: s.reconnectAttempts + 1 }));
                connectWithRetry();
              }, retryDelay);
            } else if (status === 'CLOSED') {
              console.log('🔌 Profile channel closed - attempting reconnect...');
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
      console.error('Error setting up profile realtime:', error);
      setStatus(prev => ({
        ...prev,
        lastError: error instanceof Error ? error.message : 'Unknown error',
        isConnected: false
      }));
    }
  }, [invalidateProfileQueries]);

  useEffect(() => {
    connectWithRetry();

    return () => {
      console.log('Cleaning up profile realtime subscription');
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [connectWithRetry]);

  const manualReconnect = useCallback(() => {
    console.log('Manual reconnect requested for profiles');
    setStatus(prev => ({ ...prev, reconnectAttempts: 0, lastError: null }));
    connectWithRetry();
  }, [connectWithRetry]);

  return { ...status, manualReconnect };
};
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
  const isReconnectingRef = useRef(false);
  const maxReconnectAttempts = 5;

  const invalidateProfileQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['profiles'] });
    queryClient.invalidateQueries({ queryKey: ['analytics'] });
    queryClient.invalidateQueries({ queryKey: ['realtime-data'] });
    
    setStatus(prev => ({ 
      ...prev, 
      lastUpdate: new Date() 
    }));
    
    // Only call onUpdate if we have actual data changes, not status changes
    setTimeout(() => onUpdate?.(), 100);
  }, [queryClient, onUpdate]);

  const connectWithRetry = useCallback(async () => {
    if (isReconnectingRef.current) return;
    
    try {
      isReconnectingRef.current = true;
      
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
      
      // Use stable channel name instead of timestamp
      const channel = supabase
        .channel(`profile-updates-stable`, {
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
              isReconnectingRef.current = false;
            } else if (status === 'CHANNEL_ERROR' && prev.reconnectAttempts < maxReconnectAttempts) {
              console.error('❌ Failed to subscribe to profile updates');
              newStatus.lastError = 'Channel error - will retry';
              
              // Schedule retry with longer exponential backoff
              const retryDelay = Math.min(5000 * Math.pow(2, prev.reconnectAttempts), 60000);
              console.log(`Scheduling profile retry in ${retryDelay}ms (attempt ${prev.reconnectAttempts + 1})`);
              
              reconnectTimeoutRef.current = setTimeout(() => {
                setStatus(s => ({ ...s, reconnectAttempts: s.reconnectAttempts + 1 }));
                isReconnectingRef.current = false;
                connectWithRetry();
              }, retryDelay);
            } else if (status === 'CLOSED' && prev.reconnectAttempts < maxReconnectAttempts) {
              console.log('🔌 Profile channel closed - will reconnect...');
              newStatus.lastError = 'Connection closed - reconnecting';
              
              // Longer delay for CLOSED status to prevent rapid reconnects
              reconnectTimeoutRef.current = setTimeout(() => {
                setStatus(s => ({ ...s, reconnectAttempts: s.reconnectAttempts + 1 }));
                isReconnectingRef.current = false;
                connectWithRetry();
              }, 10000);
            } else if (prev.reconnectAttempts >= maxReconnectAttempts) {
              console.log('❌ Max reconnection attempts reached for profiles');
              newStatus.lastError = 'Max reconnection attempts reached';
              isReconnectingRef.current = false;
            }

            return newStatus;
          });
        });

      channelRef.current = channel;
      
    } catch (error) {
      console.error('Error setting up profile realtime:', error);
      isReconnectingRef.current = false;
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
    isReconnectingRef.current = false;
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    setStatus(prev => ({ ...prev, reconnectAttempts: 0, lastError: null }));
    connectWithRetry();
  }, [connectWithRetry]);

  return { ...status, manualReconnect };
};
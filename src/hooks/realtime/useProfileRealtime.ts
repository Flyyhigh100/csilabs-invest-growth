import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

interface RealtimeStatus {
  isConnected: boolean;
  lastUpdate: Date | null;
  connectionAttempts: number;
}

export const useProfileRealtime = (onUpdate?: () => void) => {
  const [status, setStatus] = useState<RealtimeStatus>({
    isConnected: false,
    lastUpdate: null,
    connectionAttempts: 0
  });
  const queryClient = useQueryClient();

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

  useEffect(() => {
    console.log('Setting up profile realtime subscription...');
    
    const channel = supabase
      .channel('profile-updates')
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
        
        setStatus(prev => ({
          ...prev,
          isConnected: status === 'SUBSCRIBED',
          connectionAttempts: prev.connectionAttempts + (status === 'CHANNEL_ERROR' ? 1 : 0)
        }));

        if (status === 'SUBSCRIBED') {
          console.log('Profile realtime subscription established');
        } else if (status === 'CHANNEL_ERROR') {
          console.error('Failed to subscribe to profile updates');
        }
      });

    return () => {
      console.log('Cleaning up profile realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [invalidateProfileQueries]);

  return status;
};
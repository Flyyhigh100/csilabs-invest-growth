import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

export const useProfileRealtime = (onUpdate?: () => void) => {
  const [isConnected, setIsConnected] = useState(false);
  const queryClient = useQueryClient();

  const invalidateProfileQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['profiles'] });
    queryClient.invalidateQueries({ queryKey: ['analytics'] });
    queryClient.invalidateQueries({ queryKey: ['realtime-data'] });
    onUpdate?.();
  }, [queryClient, onUpdate]);

  useEffect(() => {
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
        setIsConnected(status === 'SUBSCRIBED');
        if (status === 'SUBSCRIBED') {
          console.log('✅ Profile realtime connected');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [invalidateProfileQueries]);

  return { isConnected };
};
import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useCommunicationRealtime = (onUpdate?: () => void) => {
  const [isConnected, setIsConnected] = useState(false);
  const queryClient = useQueryClient();

  const invalidateCommunicationQueries = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['communication-threads'] });
    queryClient.invalidateQueries({ queryKey: ['profile-notes'] });
    queryClient.invalidateQueries({ queryKey: ['communication-stats'] });
    onUpdate?.();
  }, [queryClient, onUpdate]);

  useEffect(() => {
    const channel = supabase
      .channel('communication-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'client_notes'
        },
        (payload) => {
          console.log('Communication realtime update:', payload);
          invalidateCommunicationQueries();
          
          // Show toast for new messages
          if (payload.eventType === 'INSERT' && payload.new) {
            const note = payload.new as any;
            if (note.note_type === 'client_message') {
              toast.info('New message received', {
                description: `Message from client`,
                action: {
                  label: 'View',
                  onClick: () => {
                    window.location.href = '/admin/communications';
                  }
                }
              });
            }
          }
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
        if (status === 'SUBSCRIBED') {
          console.log('✅ Communication realtime connected');
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [invalidateCommunicationQueries]);

  return { isConnected };
};
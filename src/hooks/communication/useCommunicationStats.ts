import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useCommunicationStats = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['communication-stats'],
    queryFn: async () => {
      console.log('Fetching communication stats...');
      
      // Get total unread messages (messages not created by current admin)
      const { data: unreadNotes, error: unreadError } = await supabase
        .from('client_notes')
        .select('id, user_id, created_by')
        .neq('created_by', user?.id);

      if (unreadError) throw unreadError;

      // Group by user to get unique conversations with unread messages
      const unreadByUser = new Set(
        unreadNotes?.map(note => note.user_id) || []
      );

      // Get recent messages (last 24 hours)
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

      const { data: recentNotes, error: recentError } = await supabase
        .from('client_notes')
        .select('id')
        .gte('created_at', twentyFourHoursAgo.toISOString());

      if (recentError) throw recentError;

      return {
        unreadConversations: unreadByUser.size,
        totalUnreadMessages: unreadNotes?.length || 0,
        recentMessages24h: recentNotes?.length || 0,
      };
    },
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
  });
};
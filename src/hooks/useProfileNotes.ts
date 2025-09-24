import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface ProfileNote {
  id: string;
  user_id: string;
  title: string;
  content: string;
  note_type: string;
  priority: string;
  status: string;
  tags: string[] | null;
  follow_up_date: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const useProfileNotes = (userId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Use the provided userId or current user's ID
  const targetUserId = userId || user?.id;

  const { 
    data: notes, 
    isLoading,
    error 
  } = useQuery({
    queryKey: ['profile-notes', targetUserId],
    queryFn: async () => {
      if (!targetUserId) return [];
      
      const { data, error } = await supabase
        .from('client_notes')
        .select('*')
        .eq('user_id', targetUserId)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching profile notes:', error);
        throw error;
      }
      
      return data as ProfileNote[];
    },
    enabled: !!targetUserId,
  });

  const addNote = useMutation({
    mutationFn: async ({ content, noteType = 'communication' }: { content: string; noteType?: string }) => {
      if (!user || !targetUserId) throw new Error('User not authenticated or target user not specified');

      const { data, error } = await supabase
        .from('client_notes')
        .insert({
          user_id: targetUserId,
          title: noteType === 'communication' ? 'Profile Communication' : 'Profile Note',
          content: content,
          note_type: noteType,
          priority: 'normal',
          status: 'active',
          created_by: user.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile-notes', targetUserId] });
      toast({
        title: "Success",
        description: "Note added successfully",
      });
    },
    onError: (error: any) => {
      console.error('Error adding note:', error);
      toast({
        title: "Error",
        description: "Failed to add note",
        variant: "destructive",
      });
    }
  });

  const updateNote = useMutation({
    mutationFn: async ({ noteId, content }: { noteId: string; content: string }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('client_notes')
        .update({ content, updated_at: new Date().toISOString() })
        .eq('id', noteId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile-notes', targetUserId] });
      toast({
        title: "Success",
        description: "Note updated successfully",
      });
    },
    onError: (error: any) => {
      console.error('Error updating note:', error);
      toast({
        title: "Error",
        description: "Failed to update note",
        variant: "destructive",
      });
    }
  });

  return {
    notes: notes || [],
    isLoading,
    error,
    addNote,
    updateNote
  };
};
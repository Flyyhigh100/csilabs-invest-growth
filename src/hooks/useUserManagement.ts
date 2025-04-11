
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Define proper types based on the database structure
interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null; // Add this property to match database schema
  role: string | null; // Add this property to match database schema
  status: string | null; // Add this property to match database schema
  wallet_address: string | null;
  created_at: string;
  updated_at: string;
}

interface UpdateProfileInput {
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  role?: string | null;
  status?: string | null;
  wallet_address?: string | null;
  updated_at?: string;
}

export const useUserManagement = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Fetch all users
  const { data: users = [], isLoading, error, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');
        
      if (error) throw new Error(error.message);
      
      return data as Profile[];
    }
  });
  
  // Filter users based on search query
  const filteredUsers = users.filter(user => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      (user.first_name?.toLowerCase().includes(query) || false) ||
      (user.last_name?.toLowerCase().includes(query) || false) ||
      (user.email?.toLowerCase().includes(query) || false) ||
      (user.wallet_address?.toLowerCase().includes(query) || false)
    );
  });
  
  // Update user profile
  const updateUserProfile = useMutation({
    mutationFn: async ({ userId, data }: { userId: string; data: UpdateProfileInput }) => {
      const { error } = await supabase
        .from('profiles')
        .update({
          ...data,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
        
      if (error) throw new Error(error.message);
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User profile updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update user: ${error.message}`);
    }
  });
  
  // Update user status
  const updateUserStatus = useMutation({
    mutationFn: async ({ userId, status }: { userId: string; status: string }) => {
      const { error } = await supabase
        .from('profiles')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
        
      if (error) throw new Error(error.message);
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast.success('User status updated successfully');
    },
    onError: (error) => {
      toast.error(`Failed to update user status: ${error.message}`);
    }
  });
  
  return {
    users: filteredUsers,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    updateUserProfile,
    updateUserStatus,
    refetch
  };
};

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useAdminVerification = () => {
  const { user } = useAuth();

  const { data: isAdmin, isLoading } = useQuery({
    queryKey: ['admin-verification', user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      const { data, error } = await supabase
        .from('admins')
        .select('id')
        .or(`id.eq.${user.id},email.eq.${user.email}`)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error checking admin status:', error);
        return false;
      }
      
      return !!data;
    },
    enabled: !!user,
  });

  return {
    isAdmin: isAdmin ?? false,
    isLoading
  };
};
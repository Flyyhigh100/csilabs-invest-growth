
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useProfileData = () => {
  const { user } = useAuth();

  const { 
    data: profileData, 
    isLoading, 
    error,
    refetch
  } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      // Using parameterized query to prevent SQL injection
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          first_name, 
          last_name, 
          email,
          phone_number,
          street_address,
          city,
          state_province,
          postal_code,
          wallet_address, 
          solana_wallet_address, 
          preferred_network
        `)
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        throw error;
      }
      
      return data;
    },
    enabled: !!user,
  });

  return {
    profileData,
    isLoading,
    error,
    refetch
  };
};

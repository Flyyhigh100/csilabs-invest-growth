
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface User {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  wallet_address: string | null;
  created_at: string;
  updated_at: string;
  kyc_status?: string;
  has_kyc_record?: boolean;
  kyc_complete?: boolean;
  kyc_id?: string;
}

export const useAdminUsers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  
  // Use direct edge function call to fetch users with better error handling
  const fetchUsers = async (): Promise<User[]> => {
    console.log('Fetching users for admin dashboard...');
    
    try {
      // Use the edge function to get all users
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: {
          operation: 'getAllUsers', // Changed from 'action' to 'operation'
          data: {}
        }
      });
      
      if (error) {
        console.error('Error calling admin-operations function:', error);
        throw new Error(`Failed to fetch users: ${error.message}`);
      }
      
      if (!data) {
        console.error('No data returned from admin-operations function');
        throw new Error('No data returned from server');
      }
      
      if (data.error) {
        console.error('Error in function response:', data.error);
        throw new Error(data.error.message || 'Failed to fetch users');
      }
      
      console.log(`Fetched ${data.users?.length || 0} users with details`);
      return data.users || [];
    } catch (err) {
      console.error('Error in fetchUsers:', err);
      throw err;
    }
  };
  
  const { 
    data: users = [], 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['admin-users', retryCount],
    queryFn: fetchUsers,
    staleTime: 30000, // Consider data stale after 30 seconds
    refetchInterval: 60000, // Refresh every minute
    retry: 1, // Only retry once
    refetchOnWindowFocus: true,
  });

  const handleRefresh = () => {
    setRetryCount(prev => prev + 1);
    refetch();
    toast.success('Refreshing user data...');
  };
  
  const checkUserKyc = async (userId: string) => {
    try {
      toast.info(`Checking KYC status for user ${userId}...`);
      refetch();
      toast.success('User data refreshed');
    } catch (error) {
      console.error(`Error checking KYC for user ${userId}:`, error);
      toast.error('Error refreshing user data');
    }
  };
  
  // Placeholder function that does nothing now
  const testDatabaseConnection = () => {};

  return {
    users,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    handleRefresh,
    checkUserKyc,
    testDatabaseConnection,
    refetch
  };
};


import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTestDataToggle } from './useTestDataToggle';

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
  has_test_data?: boolean;
  test_transaction_count?: number;
  test_transaction_value?: number;
}

export const useAdminUsers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const { includeTestData } = useTestDataToggle();
  
  // Use direct edge function call to fetch users with better error handling
  const fetchUsers = async (): Promise<User[]> => {
    console.log('Fetching users for admin dashboard...');
    
    try {
      // Use the edge function to get all users
      const { data, error } = await supabase.functions.invoke('admin-operations', {
        body: {
          operation: 'getAllUsers',
          data: {
            includeTestData
          }
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
      
      // Process users to check for test data
      const usersWithTestDataFlag = await addTestDataFlags(data.users || []);
      
      return usersWithTestDataFlag;
    } catch (err) {
      console.error('Error in fetchUsers:', err);
      throw err;
    }
  };
  
  // Add test data flags to users
  const addTestDataFlags = async (users: User[]): Promise<User[]> => {
    try {
      // Get test transactions for all users
      const { data: testTransactions, error } = await supabase
        .from('transactions')
        .select('user_id, amount')
        .eq('is_test', true);
      
      if (error) throw error;
      
      // Create a map of user_id -> test transaction stats
      const testDataMap: Record<string, { count: number; value: number }> = {};
      
      testTransactions?.forEach(tx => {
        if (!tx.user_id) return;
        
        if (!testDataMap[tx.user_id]) {
          testDataMap[tx.user_id] = { count: 0, value: 0 };
        }
        
        testDataMap[tx.user_id].count++;
        testDataMap[tx.user_id].value += Number(tx.amount || 0);
      });
      
      // Add test data flag to each user
      return users.map(user => ({
        ...user,
        has_test_data: !!testDataMap[user.id],
        test_transaction_count: testDataMap[user.id]?.count || 0,
        test_transaction_value: testDataMap[user.id]?.value || 0
      }));
    } catch (err) {
      console.error('Error adding test data flags to users:', err);
      return users; // Return original users if there's an error
    }
  };
  
  const { 
    data: users = [], 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['admin-users', retryCount, includeTestData],
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

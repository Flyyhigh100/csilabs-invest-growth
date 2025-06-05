
import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
  // Enhanced authentication fields
  email_confirmed_at?: string | null;
  confirmed_at?: string | null;
  last_sign_in_at?: string | null;
  auth_created_at?: string | null;
  phone_confirmed_at?: string | null;
  email_confirmed?: boolean;
  auth_method?: string;
  signup_method?: string;
  is_anonymous?: boolean;
  providers?: string[];
}

export const useAdminUsers = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const { includeTestData } = useTestDataToggle();
  const queryClient = useQueryClient();
  
  // Use direct edge function call to fetch users with better error handling
  const fetchUsers = async (): Promise<User[]> => {
    console.log('🔄 Fetching users for admin dashboard with enhanced auth data...');
    
    try {
      // Get the current session first
      const { data: session, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) {
        console.error('❌ Session error:', sessionError);
        throw new Error(`Authentication error: ${sessionError.message}`);
      }
      
      if (!session?.session?.access_token) {
        console.error('❌ No valid session found');
        throw new Error('No valid authentication session found');
      }
      
      console.log('✅ Valid session found, calling admin-operations edge function...');
      
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
        console.error('❌ Error calling admin-operations function:', error);
        toast.error(`Failed to load users: ${error.message}`);
        throw new Error(`Failed to fetch users: ${error.message}`);
      }
      
      if (!data) {
        console.error('❌ No data returned from admin-operations function');
        throw new Error('No data returned from server');
      }
      
      if (data.error) {
        console.error('❌ Error in function response:', data.error);
        toast.error(`Server error: ${data.error.message || 'Failed to fetch users'}`);
        throw new Error(data.error.message || 'Failed to fetch users');
      }
      
      console.log(`✅ Successfully fetched ${data.users?.length || 0} users with enhanced auth details`);
      
      // Process users to check for test data
      const usersWithTestDataFlag = await addTestDataFlags(data.users || []);
      
      return usersWithTestDataFlag;
    } catch (err) {
      console.error('💥 Error in fetchUsers:', err);
      
      // Show user-friendly error message
      if (err instanceof Error) {
        if (err.message.includes('Authentication')) {
          toast.error('Authentication failed. Please log in again.');
        } else if (err.message.includes('Admin access required')) {
          toast.error('Admin privileges required to view users.');
        } else {
          toast.error(`Failed to load users: ${err.message}`);
        }
      } else {
        toast.error('An unexpected error occurred while loading users.');
      }
      
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
      
      if (error) {
        console.warn('⚠️ Could not fetch test transaction data:', error);
        // Don't throw here, just return users without test data flags
        return users;
      }
      
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
      console.error('⚠️ Error adding test data flags to users:', err);
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
    retry: 2, // Retry twice on failure
    refetchOnWindowFocus: true,
    onError: (error) => {
      console.error('🔥 Query error in useAdminUsers:', error);
    }
  });

  const handleRefresh = () => {
    console.log('🔄 Manual refresh triggered for admin users...');
    setRetryCount(prev => prev + 1);
    
    // Invalidate both users and transaction stats queries
    queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    queryClient.invalidateQueries({ queryKey: ['user-transaction-stats'] });
    
    refetch();
    toast.success('Refreshing user data...');
  };
  
  const checkUserKyc = async (userId: string) => {
    try {
      console.log(`🔍 Checking KYC status for user ${userId}...`);
      toast.info(`Checking KYC status for user ${userId}...`);
      
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['user-transaction-stats'] });
      
      refetch();
      toast.success('User data refreshed');
    } catch (error) {
      console.error(`❌ Error checking KYC for user ${userId}:`, error);
      toast.error('Error refreshing user data');
    }
  };
  
  // Placeholder function that does nothing now
  const testDatabaseConnection = () => {
    console.log('🔧 Database connection test triggered');
  };

  // Add debug info
  console.log('📊 Admin Users Hook State:', {
    usersCount: users.length,
    isLoading,
    hasError: !!error,
    retryCount,
    includeTestData
  });

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


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
  
  // Enhanced fetch function with better authentication handling
  const fetchUsers = async (): Promise<User[]> => {
    console.log('🔄 Fetching users for admin dashboard...');
    
    try {
      // Get fresh session with better error handling
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('❌ Session error:', sessionError);
        throw new Error(`Authentication error: ${sessionError.message}`);
      }
      
      if (!sessionData?.session?.access_token) {
        console.error('❌ No valid session found');
        // Try to refresh the session
        const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
        
        if (refreshError || !refreshData?.session?.access_token) {
          throw new Error('Authentication session expired. Please log in again.');
        }
        
        console.log('✅ Session refreshed successfully');
      }
      
      console.log('✅ Valid session found, calling admin-operations edge function...');
      
      // Call the edge function with proper error handling
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
        
        // If authentication error, try fallback approach
        if (error.message?.includes('Auth') || error.message?.includes('401')) {
          console.log('🔄 Auth error detected, attempting fallback...');
          return await fetchUsersFallback();
        }
        
        throw new Error(`Failed to fetch users: ${error.message}`);
      }
      
      if (!data) {
        console.error('❌ No data returned from admin-operations function');
        throw new Error('No data returned from server');
      }
      
      if (data.error) {
        console.error('❌ Error in function response:', data.error);
        
        // Try fallback for certain errors
        if (data.error.message?.includes('Auth') || data.error.message?.includes('unauthorized')) {
          console.log('🔄 Server auth error detected, attempting fallback...');
          return await fetchUsersFallback();
        }
        
        throw new Error(data.error.message || 'Failed to fetch users');
      }
      
      console.log(`✅ Successfully fetched ${data.users?.length || 0} users with enhanced auth details`);
      
      // Process users to add test data flags
      const usersWithTestDataFlag = await addTestDataFlags(data.users || []);
      
      return usersWithTestDataFlag;
    } catch (err) {
      console.error('💥 Error in fetchUsers:', err);
      
      // Show user-friendly error message
      if (err instanceof Error) {
        if (err.message.includes('Authentication') || err.message.includes('session expired')) {
          toast.error('Authentication failed. Please log in again.');
        } else if (err.message.includes('Admin access required')) {
          toast.error('Admin privileges required to view users.');
        } else {
          toast.error(`Failed to load users: ${err.message}`);
        }
      } else {
        toast.error('An unexpected error occurred while loading users.');
      }
      
      // Try fallback approach as last resort
      try {
        console.log('🔄 Attempting fallback user fetch...');
        return await fetchUsersFallback();
      } catch (fallbackError) {
        console.error('💥 Fallback also failed:', fallbackError);
        throw err;
      }
    }
  };
  
  // Fallback function to fetch basic user data directly from Supabase
  const fetchUsersFallback = async (): Promise<User[]> => {
    console.log('🔄 Using fallback approach to fetch users...');
    
    try {
      // Check admin status first
      const { data: isAdmin, error: adminError } = await supabase.rpc('is_admin');
      
      if (adminError || !isAdmin) {
        throw new Error('Admin access required');
      }
      
      // Fetch basic user profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
        
      if (profilesError) {
        throw new Error(`Failed to fetch user profiles: ${profilesError.message}`);
      }
      
      console.log(`✅ Fallback: fetched ${profilesData?.length || 0} user profiles`);
      
      // Get KYC data
      const { data: kycData, error: kycError } = await supabase
        .from('kyc_verifications')
        .select('*');
        
      if (kycError) {
        console.warn('⚠️ Could not fetch KYC data in fallback:', kycError);
      }
      
      // Create KYC map
      const kycMap = {};
      if (kycData && kycData.length > 0) {
        kycData.forEach(record => {
          kycMap[record.user_id] = {
            status: record.status,
            id: record.id,
            kycComplete: Boolean(
              record.first_name && 
              record.last_name && 
              record.id_front_url && 
              record.id_back_url &&
              record.selfie_url
            )
          };
        });
      }
      
      // Combine data with basic auth info
      const usersWithDetails = (profilesData || []).map(profile => {
        const kycInfo = kycMap[profile.id] || { status: 'not_started', kycComplete: false };
        
        return {
          id: profile.id,
          first_name: profile.first_name || '',
          last_name: profile.last_name || '',
          email: profile.email || 'N/A',
          wallet_address: profile.wallet_address || 'Not set',
          created_at: profile.created_at,
          updated_at: profile.updated_at,
          kyc_status: kycInfo.status,
          kyc_id: kycInfo.id,
          has_kyc_record: Boolean(kycInfo.id),
          kyc_complete: kycInfo.kycComplete,
          // Basic auth fields for fallback
          email_confirmed: false,
          auth_method: 'Unknown',
          signup_method: 'Unknown',
          is_anonymous: false,
          providers: []
        };
      });
      
      // Add test data flags
      const usersWithTestDataFlag = await addTestDataFlags(usersWithDetails);
      
      console.log(`✅ Fallback: returning ${usersWithTestDataFlag.length} users`);
      toast.info('Users loaded using fallback method. Some enhanced features may be limited.');
      
      return usersWithTestDataFlag;
    } catch (fallbackError) {
      console.error('💥 Fallback fetch failed:', fallbackError);
      throw new Error(`Fallback fetch failed: ${fallbackError.message}`);
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
      return users;
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
    staleTime: 30000,
    refetchInterval: 60000,
    retry: 1, // Reduce retries since we have fallback
    refetchOnWindowFocus: true,
  });

  const handleRefresh = () => {
    console.log('🔄 Manual refresh triggered for admin users...');
    setRetryCount(prev => prev + 1);
    
    // Invalidate related queries
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
    refetch
  };
};

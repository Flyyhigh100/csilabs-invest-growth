
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import { toast } from 'sonner';
import { useTestDataToggle } from '@/hooks/admin/useTestDataToggle';

interface DashboardStats {
  kycCounts: {
    pending: number;
    approved: number;
    rejected: number;
    not_started: number;
    needs_clarification: number;
  };
  pendingTokensCount: number;
  totalTransactionValue: number;
  totalDistributedTokens: number;
}

const fetchDashboardStats = async (includeTestData: boolean = false): Promise<DashboardStats> => {
  console.log(`Fetching dashboard stats... (includeTestData: ${includeTestData})`);
  
  try {
    // CRITICAL FIX: Fetch counts for KYC verifications by status with enhanced logging
    const kycQuery = supabase
      .from('kyc_verifications')
      .select('*');
      
    // Filter out test data if not included
    if (!includeTestData) {
      kycQuery.eq('is_test', false);
    }
    
    const { data: kycData, error: kycError } = await kycQuery;
    
    if (kycError) {
      console.error('Error fetching KYC stats:', kycError);
      throw kycError;
    }
    
    console.log('KYC data raw response:', kycData);
    console.log('KYC data count:', kycData?.length || 0);
    
    // Process KYC counts manually since groupBy is not available
    const kycCounts = {
      pending: 0,
      approved: 0,
      rejected: 0,
      not_started: 0,
      needs_clarification: 0
    };
    
    if (kycData && kycData.length > 0) {
      kycData.forEach(item => {
        // Enhanced error handling and logging for KYC status
        const status = item.status as string;
        if (status in kycCounts) {
          kycCounts[status as keyof typeof kycCounts]++;
        } else {
          console.warn(`Found unknown KYC status: ${status}`, item);
        }
      });
      
      console.log('Processed KYC counts:', kycCounts);
    }
    
    // Fetch distributed tokens (completed transactions with tokens sent)
    const distributedTokensQuery = supabase
      .from('transactions')
      .select('token_amount')
      .eq('status', 'completed')
      .eq('token_sent', true);
      
    // Filter out test data if not included
    if (!includeTestData) {
      distributedTokensQuery.eq('is_test', false);
    }
    
    const { data: distributedTokensData, error: distributedError } = await distributedTokensQuery;
    
    if (distributedError) {
      console.error('Error fetching distributed tokens:', distributedError);
      throw distributedError;
    }
    
    // Calculate total distributed tokens
    const totalDistributedTokens = distributedTokensData
      ? distributedTokensData.reduce((sum, tx) => sum + Number(tx.token_amount || 0), 0)
      : 0;
    
    // Fetch pending token transfers count
    const pendingTokensQuery = supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed')
      .eq('token_sent', false);
      
    // Filter out test data if not included
    if (!includeTestData) {
      pendingTokensQuery.eq('is_test', false);
    }
    
    const { count: pendingTokensCount, error: pendingError } = await pendingTokensQuery;
    
    // Fetch total transaction value
    const transactionsQuery = supabase
      .from('transactions')
      .select('amount')
      .eq('status', 'completed');
      
    // Filter out test data if not included
    if (!includeTestData) {
      transactionsQuery.eq('is_test', false);
    }
    
    const { data: transactionData, error: transactionError } = await transactionsQuery;
    
    if (transactionError) {
      console.error('Error fetching transaction data:', transactionError);
      throw transactionError;
    }
    
    // Calculate total transaction value
    const totalValue = transactionData
      ? transactionData.reduce((sum, tx) => sum + Number(tx.amount), 0)
      : 0;
    
    return {
      kycCounts,
      pendingTokensCount: pendingTokensCount || 0,
      totalTransactionValue: totalValue,
      totalDistributedTokens,
    };
  } catch (error) {
    console.error('Exception in fetchDashboardStats:', error);
    throw error;
  }
};

export const useDashboardStats = () => {
  // Use the shared test data toggle hook
  const { includeTestData } = useTestDataToggle();
  
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['admin-dashboard-stats', includeTestData],
    queryFn: () => fetchDashboardStats(includeTestData),
    // More aggressive refetching settings
    refetchInterval: 3000, // Refresh more frequently
    staleTime: 1000, // Consider data stale after just 1 second
  });
  
  useEffect(() => {
    // Force refetch when component mounts
    refetch();
    
    // Set up realtime subscription for KYC verifications
    const channel = supabase
      .channel('admin-dashboard-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'kyc_verifications'
        },
        (payload) => {
          console.log('Realtime update received for kyc_verifications:', payload);
          toast.info('KYC verification updated');
          refetch();
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status for dashboard:', status);
      });
    
    return () => {
      // Clean up subscription when component unmounts
      supabase.removeChannel(channel);
    };
  }, [refetch, includeTestData]);
  
  return {
    data,
    isLoading,
    error,
    refetch,
    includeTestData
  };
};

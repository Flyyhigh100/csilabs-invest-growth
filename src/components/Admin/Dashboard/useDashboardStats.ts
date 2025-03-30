
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

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
}

const fetchDashboardStats = async (): Promise<DashboardStats> => {
  console.log('Fetching dashboard stats...');
  
  try {
    // Fetch counts for KYC verifications by status
    const { data: kycData, error: kycError } = await supabase
      .from('kyc_verifications')
      .select('status');
    
    if (kycError) {
      console.error('Error fetching KYC stats:', kycError);
      throw kycError;
    }
    
    console.log('KYC data fetched for dashboard:', kycData);
    
    // Process KYC counts manually since groupBy is not available
    const kycCounts = {
      pending: 0,
      approved: 0,
      rejected: 0,
      not_started: 0,
      needs_clarification: 0
    };
    
    if (kycData) {
      kycData.forEach(item => {
        if (item.status in kycCounts) {
          kycCounts[item.status as keyof typeof kycCounts]++;
        }
      });
    }
    
    console.log('KYC counts for dashboard:', kycCounts);
    
    // Fetch counts for pending token transfers
    const { count: pendingTokensCount, error: pendingError } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed')
      .eq('token_sent', false);
    
    if (pendingError) {
      console.error('Error fetching pending tokens count:', pendingError);
      throw pendingError;
    }
    
    // Fetch total transaction value
    const { data: transactionData, error: transactionError } = await supabase
      .from('transactions')
      .select('amount')
      .eq('status', 'completed');
    
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
      totalTransactionValue: totalValue
    };
  } catch (error) {
    console.error('Exception in fetchDashboardStats:', error);
    throw error;
  }
};

export const useDashboardStats = () => {
  const { 
    data, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['admin-dashboard-stats'],
    queryFn: fetchDashboardStats,
    refetchInterval: 30000, // Refresh data every 30 seconds (reduced from 60s)
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
          refetch();
        }
      )
      .subscribe();
    
    return () => {
      // Clean up subscription when component unmounts
      supabase.removeChannel(channel);
    };
  }, [refetch]);
  
  return {
    data,
    isLoading,
    error,
    refetch
  };
};

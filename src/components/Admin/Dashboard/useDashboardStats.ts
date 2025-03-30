
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import { toast } from 'sonner';

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
    // CRITICAL FIX: Fetch counts for KYC verifications by status with enhanced logging
    const { data: kycData, error: kycError } = await supabase
      .from('kyc_verifications')
      .select('*');
    
    if (kycError) {
      console.error('Error fetching KYC stats:', kycError);
      throw kycError;
    }
    
    console.log('KYC data raw response:', kycData);
    console.log('KYC data count:', kycData?.length || 0);
    
    // CRITICAL FIX: Log the first few KYC records for debugging
    if (kycData && kycData.length > 0) {
      console.log('First few KYC records:', kycData.slice(0, 3));
    }
    
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
        // CRITICAL FIX: Enhanced error handling and logging for KYC status
        const status = item.status as string;
        if (status in kycCounts) {
          kycCounts[status as keyof typeof kycCounts]++;
        } else {
          console.warn(`Found unknown KYC status: ${status}`, item);
        }
      });
      
      console.log('Processed KYC counts:', kycCounts);
    } else {
      console.warn('No KYC data found or empty array returned');
      
      // CRITICAL FIX: Do a direct check to verify if we can access the data
      const { data: directCheck, error: directError } = await supabase
        .from('kyc_verifications')
        .select('id, status', { count: 'exact' });
        
      if (directError) {
        console.error('Direct KYC data check failed:', directError);
      } else {
        console.log(`Direct KYC check found ${directCheck?.length || 0} records`);
      }
    }
    
    // CRITICAL FIX: Fetch counts for pending token transfers
    const { count: pendingTokensCount, error: pendingError } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'completed')
      .eq('token_sent', false);
    
    if (pendingError) {
      console.error('Error fetching pending tokens count:', pendingError);
      throw pendingError;
    }
    
    // CRITICAL FIX: Fetch total transaction value
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
    
    // For debugging, log direct database query with counts
    const { data: kycDebug, error: kycDebugError } = await supabase
      .from('kyc_verifications')
      .select('*');
      
    if (kycDebugError) {
      console.error('Error in direct KYC debug query:', kycDebugError);
    } else {
      console.log(`Direct KYC debug query found ${kycDebug?.length || 0} records`);
      
      // Count by status for debugging
      const debugCounts = {
        pending: 0,
        approved: 0,
        rejected: 0,
        not_started: 0,
        needs_clarification: 0
      };
      
      kycDebug?.forEach(item => {
        if (item.status in debugCounts) {
          debugCounts[item.status as keyof typeof debugCounts]++;
        }
      });
      
      console.log('Debug KYC counts by status:', debugCounts);
      console.log('All KYC records:', kycDebug);
    }
    
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
    // CRITICAL FIX: More aggressive refetching settings
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
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to realtime updates for admin dashboard');
        } else {
          console.log('❌ Failed to subscribe to realtime updates for admin dashboard');
        }
      });
    
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

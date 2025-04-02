
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { 
  fetchKycVerifications, 
  testDirectKycAccess, 
  listAllUsersWithKycStatus, 
  verifyAdminAccess 
} from '../../KycVerificationsService';
import { KycVerificationWithProfile } from '../../types';

export const useAdminKycDataFetcher = (isAdmin: boolean | null) => {
  // State for debug information
  const [lastFetchTime, setLastFetchTime] = useState<string | null>(null);
  const [manualRefreshCount, setManualRefreshCount] = useState(0);
  const [realtimeEnabled, setRealtimeEnabled] = useState(false);
  const [directTestResults, setDirectTestResults] = useState<string | null>(null);
  const [showAllUsers, setShowAllUsers] = useState(false);

  // CRITICAL FIX: Implement more aggressive refetching with shorter intervals and better logging
  const { 
    data: kycVerifications = [], 
    isLoading, 
    error,
    refetch
  } = useQuery({
    queryKey: ['admin-kyc-verifications', manualRefreshCount],
    queryFn: async () => {
      console.log('Fetching KYC verifications with admin access - after RLS policy update');
      
      // First verify admin access
      const adminAccess = await verifyAdminAccess();
      if (!adminAccess) {
        console.error('User does not have admin access to KYC verifications');
        toast.error('Admin access required to view KYC verifications');
        return [];
      }
      
      try {
        const results = await fetchKycVerifications();
        console.log(`Fetched ${results.length} KYC verifications with updated RLS policies`);
        
        if (results.length > 0) {
          console.log('First few KYC records:', results.slice(0, 3));
        } else {
          console.warn('WARNING: No KYC records returned with updated RLS policies');
          
          // Force a direct test to check database access
          const directTest = await testDirectKycAccess();
          console.log('Direct database access test results:', directTest);
          
          if (directTest.count > 0) {
            console.error('CRITICAL ERROR: Direct test found records but main query returned none');
            toast.error('Database access issue detected. Direct query found records but main query did not.');
          }
        }
        
        // Count by status for debugging
        const statusCounts = results.reduce((counts, item) => {
          counts[item.status] = (counts[item.status] || 0) + 1;
          return counts;
        }, {} as Record<string, number>);
        
        console.log('KYC verification status counts with updated RLS:', statusCounts);
        
        setLastFetchTime(new Date().toISOString());
        return results;
      } catch (err) {
        console.error('Error fetching KYC verifications with updated RLS:', err);
        toast.error('Failed to fetch KYC verifications. Check console for details.');
        throw err;
      }
    },
    // More aggressive refetching settings
    refetchInterval: 5000, // Refresh every 5 seconds
    refetchOnWindowFocus: true,
    staleTime: 1000, // Consider data stale after 1 second
    enabled: isAdmin === true, // Only fetch if user is confirmed admin
  });
  
  // Query to fetch all users with KYC status for debugging
  const { 
    data: allUsersWithKyc = [], 
    refetch: refetchAllUsers 
  } = useQuery({
    queryKey: ['admin-all-users-kyc'],
    queryFn: listAllUsersWithKycStatus,
    enabled: showAllUsers && isAdmin === true,
  });

  const handleManualRefresh = async () => {
    console.log('Manual refresh triggered with updated RLS policies');
    setManualRefreshCount(prev => prev + 1);
    
    // Check admin access first
    const adminAccess = await verifyAdminAccess();
    if (!adminAccess) {
      toast.error('You do not have admin permissions to view KYC verifications');
      return;
    }
    
    // Run a direct test to verify RLS policy changes
    try {
      const directTest = await testDirectKycAccess();
      setDirectTestResults(JSON.stringify({
        count: directTest.count,
        pendingCount: directTest.pendingCount,
        statusCounts: directTest.statusCounts,
        firstRecord: directTest.records?.[0] || null
      }, null, 2));
      
      if (directTest.count > 0) {
        toast.success(`Found ${directTest.count} KYC records with RLS policies`);
      } else {
        toast.warning('No KYC records found even with updated RLS policies');
      }
    } catch (error) {
      console.error('Error in direct database test with updated RLS:', error);
      toast.error('Error running direct database test');
    }
    
    // Standard refetch
    refetch();
    if (showAllUsers) refetchAllUsers();
    toast.success('Refreshing KYC data with updated RLS policies...');
  };

  // Set up realtime subscription
  useEffect(() => {
    // Set up realtime subscription for KYC verifications with improved error handling
    console.log('Setting up realtime subscription for kyc_verifications table with updated RLS policies...');
    const channel = supabase
      .channel('kyc-verification-updates-with-updated-rls')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'kyc_verifications'
        },
        (payload) => {
          console.log('Realtime update received for kyc_verifications with updated RLS:', payload);
          setRealtimeEnabled(true);
          
          // Always refetch when we get an update
          refetch();
          
          // Show informative toast notification
          if (payload.eventType === 'INSERT') {
            toast.info('New KYC verification submitted');
          } else if (payload.eventType === 'UPDATE') {
            const newRecord = payload.new as any;
            toast.info(`KYC verification updated: ${newRecord.status}`);
          }
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status with updated RLS:', status);
        
        if (status === 'SUBSCRIBED') {
          setRealtimeEnabled(true);
          console.log('✅ Successfully subscribed to realtime updates with updated RLS policies');
          toast.success('Realtime updates enabled for KYC verifications');
        } else if (status === 'CHANNEL_ERROR') {
          setRealtimeEnabled(false);
          console.error('❌ Failed to subscribe to realtime updates');
          toast.error('Failed to enable realtime updates');
        }
      });
    
    // Clean up subscription when component unmounts
    return () => {
      console.log('Cleaning up realtime subscription');
      supabase.removeChannel(channel);
    };
  }, [refetch]);

  return {
    kycVerifications,
    isLoading,
    error,
    lastFetchTime,
    directTestResults,
    realtimeEnabled,
    manualRefreshCount,
    setManualRefreshCount,
    showAllUsers,
    setShowAllUsers,
    allUsersWithKyc,
    handleManualRefresh,
    refetch,
    refetchAllUsers,
    setDirectTestResults
  };
};

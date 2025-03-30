
import React, { useEffect, useState } from 'react';
import { useKycContext } from '../KycContext';
import { useKycActionHandlers } from '../KycActionHandlers';
import { toast } from 'sonner';
import KycDetailModal from '../modals/KycDetailModal';
import KycDashboardHeader from './KycDashboardHeader';
import KycDebugCard from './KycDebugCard';
import KycVerificationsContainer from './KycVerificationsContainer';
import { useQuery } from '@tanstack/react-query';
import { fetchKycVerifications, testDirectKycAccess } from '../KycVerificationsService';
import { supabase } from '@/integrations/supabase/client';

const KycVerificationsDashboard: React.FC = () => {
  // Context hooks
  const {
    selectedKyc,
    setSelectedKyc,
    isViewModalOpen,
    setIsViewModalOpen,
    activeTab,
    setActiveTab,
    rejectionReason,
    setRejectionReason,
    clarificationMessage,
    setClarificationMessage
  } = useKycContext();
  
  // Action handlers
  const { 
    handleApprove, 
    handleReject, 
    handleRequestClarification, 
    isPending 
  } = useKycActionHandlers(() => setIsViewModalOpen(false));
  
  // State for debug information
  const [lastFetchTime, setLastFetchTime] = useState<string | null>(null);
  const [manualRefreshCount, setManualRefreshCount] = useState(0);
  const [realtimeEnabled, setRealtimeEnabled] = useState(false);
  const [directTestResults, setDirectTestResults] = useState<string | null>(null);
  
  // CRITICAL FIX: Implement more aggressive refetching with shorter intervals
  const { 
    data: kycVerifications = [], 
    isLoading, 
    error,
    refetch
  } = useQuery({
    queryKey: ['admin-kyc-verifications', manualRefreshCount],
    queryFn: async () => {
      console.log('Fetching KYC verifications in dashboard component...');
      try {
        // CRITICAL FIX: Log the raw data
        const results = await fetchKycVerifications();
        console.log(`Fetched ${results.length} KYC verifications in dashboard component`);
        
        // CRITICAL FIX: Log the first few records for debugging
        if (results.length > 0) {
          console.log('First few KYC records:', results.slice(0, 3));
        } else {
          console.warn('WARNING: No KYC records returned from fetchKycVerifications');
          // CRITICAL FIX: Run a direct test to check if we can access the data
          const directTest = await testDirectKycAccess();
          console.log('Direct test results:', directTest);
          if (directTest.count > 0) {
            console.error('CRITICAL ERROR: Direct test found records but fetchKycVerifications returned none');
          }
        }
        
        // Count by status for debugging
        const statusCounts = results.reduce((counts, item) => {
          counts[item.status] = (counts[item.status] || 0) + 1;
          return counts;
        }, {} as Record<string, number>);
        
        console.log('KYC verification status counts in dashboard:', statusCounts);
        
        setLastFetchTime(new Date().toISOString());
        return results;
      } catch (err) {
        console.error('Error fetching KYC verifications in dashboard component:', err);
        throw err;
      }
    },
    // CRITICAL FIX: More aggressive refetching settings
    refetchInterval: 3000, // Refresh every 3 seconds
    refetchOnWindowFocus: true,
    staleTime: 500, // Consider data stale after 500ms
  });
  
  const handleViewDetails = (kyc: typeof selectedKyc) => {
    console.log('Viewing KYC details:', kyc);
    setSelectedKyc(kyc);
    setRejectionReason('');
    setClarificationMessage('');
    setIsViewModalOpen(true);
  };
  
  const handleManualRefresh = async () => {
    console.log('Manual refresh triggered');
    setManualRefreshCount(prev => prev + 1);
    
    // CRITICAL FIX: Also run a direct test to debug connection issues
    try {
      const directTest = await testDirectKycAccess();
      setDirectTestResults(JSON.stringify({
        count: directTest.count,
        pendingCount: directTest.pendingCount,
        statusCounts: directTest.statusCounts,
        firstRecord: directTest.records?.[0] || null
      }, null, 2));
      
      if (directTest.count > 0) {
        toast.success(`Found ${directTest.count} KYC records in direct test`);
      } else {
        toast.warning('No KYC records found in direct test');
      }
    } catch (error) {
      console.error('Error in direct test:', error);
      toast.error('Error running direct database test');
    }
    
    // Standard refetch
    refetch();
    toast.success('Refreshing KYC data...');
  };
  
  useEffect(() => {
    // CRITICAL FIX: Force immediate data fetch on component mount
    console.log('KYC Verifications component mounted, fetching data...');
    handleManualRefresh();
    
    // Clear messages when modal is closed
    if (!isViewModalOpen) {
      setRejectionReason('');
      setClarificationMessage('');
    }
    
    // Set up realtime subscription for KYC verifications
    console.log('Setting up realtime subscription for kyc_verifications table...');
    const channel = supabase
      .channel('kyc-verification-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'kyc_verifications'
        },
        (payload) => {
          console.log('Realtime update received for kyc_verifications:', payload);
          setRealtimeEnabled(true);
          
          // CRITICAL FIX: Always refetch when we get an update and show detailed toast
          refetch();
          
          // Show informative toast notification based on the change type
          if (payload.eventType === 'INSERT') {
            toast.info('New KYC verification submitted');
          } else if (payload.eventType === 'UPDATE') {
            const newRecord = payload.new as any;
            toast.info(`KYC verification updated: ${newRecord.status}`);
          }
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
        
        if (status === 'SUBSCRIBED') {
          setRealtimeEnabled(true);
          console.log('✅ Successfully subscribed to realtime updates for kyc_verifications');
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
  }, [isViewModalOpen, refetch]);
  
  return (
    <div className="space-y-6">
      <KycDashboardHeader 
        onManualRefresh={handleManualRefresh}
        onDirectDatabaseTest={testResults => setDirectTestResults(testResults)}
        refetch={refetch}
      />
      
      <KycDebugCard
        lastFetchTime={lastFetchTime}
        realtimeEnabled={realtimeEnabled}
        kycVerifications={kycVerifications}
        directTestResults={directTestResults}
      />
      
      <KycVerificationsContainer
        kycVerifications={kycVerifications}
        isLoading={isLoading}
        error={error}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onViewDetails={handleViewDetails}
        refetch={refetch}
      />
      
      <KycDetailModal
        open={isViewModalOpen}
        onOpenChange={setIsViewModalOpen}
        selectedKyc={selectedKyc}
        rejectionReason={rejectionReason}
        setRejectionReason={setRejectionReason}
        clarificationMessage={clarificationMessage}
        setClarificationMessage={setClarificationMessage}
        onApprove={() => handleApprove(selectedKyc)}
        onReject={() => handleReject(selectedKyc, rejectionReason)}
        onRequestClarification={() => handleRequestClarification(selectedKyc, clarificationMessage)}
        isPending={isPending}
      />
    </div>
  );
};

export default KycVerificationsDashboard;

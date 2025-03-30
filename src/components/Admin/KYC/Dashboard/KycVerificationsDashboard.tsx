
import React, { useEffect } from 'react';
import { useKycContext } from '../KycContext';
import { useKycActionHandlers } from '../KycActionHandlers';
import { toast } from 'sonner';
import KycDetailModal from '../KycDetailModal';
import KycDashboardHeader from './KycDashboardHeader';
import KycDebugCard from './KycDebugCard';
import KycVerificationsContainer from './KycVerificationsContainer';
import { useQuery } from '@tanstack/react-query';
import { fetchKycVerifications } from '../KycVerificationsService';
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
  const [lastFetchTime, setLastFetchTime] = React.useState<string | null>(null);
  const [manualRefreshCount, setManualRefreshCount] = React.useState(0);
  const [realtimeEnabled, setRealtimeEnabled] = React.useState(false);
  const [directTestResults, setDirectTestResults] = React.useState<string | null>(null);
  
  // Fetch KYC verifications
  const { 
    data: kycVerifications = [], 
    isLoading, 
    error,
    refetch
  } = useQuery({
    queryKey: ['admin-kyc-verifications', manualRefreshCount],
    queryFn: async () => {
      console.log('Fetching KYC verifications...');
      try {
        const results = await fetchKycVerifications();
        console.log(`Fetched ${results.length} KYC verifications`);
        
        // Log pending verifications count
        const pendingCount = results.filter(v => v.status === 'pending').length;
        console.log(`Found ${pendingCount} pending verifications`);
        
        // Log the data for debugging
        if (pendingCount === 0 && results.length > 0) {
          console.log('No pending verifications found. All verifications:', results);
        } else if (pendingCount > 0) {
          console.log('Pending verifications:', results.filter(v => v.status === 'pending'));
        }
        
        setLastFetchTime(new Date().toISOString());
        return results;
      } catch (err) {
        console.error('Error fetching KYC verifications:', err);
        throw err;
      }
    },
    refetchInterval: 5000, // Refresh every 5 seconds - more frequent updates
    refetchOnWindowFocus: true,
    staleTime: 1000, // Consider data stale after 1 second - more aggressive refresh
  });
  
  const handleViewDetails = (kyc: typeof selectedKyc) => {
    console.log('Viewing KYC details:', kyc);
    setSelectedKyc(kyc);
    setRejectionReason('');
    setClarificationMessage('');
    setIsViewModalOpen(true);
  };
  
  const handleManualRefresh = () => {
    console.log('Manual refresh triggered');
    setManualRefreshCount(prev => prev + 1);
    refetch();
    toast.success('Refreshing KYC data...');
  };
  
  useEffect(() => {
    // Force refetch when component mounts to ensure fresh data
    console.log('KYC Verifications component mounted, fetching data...');
    refetch();
    
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
          
          // Always refetch when we get an update
          refetch();
          
          // Show toast notification based on the change type
          if (payload.eventType === 'INSERT') {
            toast.info('New KYC verification submitted');
          } else if (payload.eventType === 'UPDATE') {
            toast.info('KYC verification updated');
          }
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
        
        if (status === 'SUBSCRIBED') {
          setRealtimeEnabled(true);
          console.log('✅ Successfully subscribed to realtime updates for kyc_verifications');
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

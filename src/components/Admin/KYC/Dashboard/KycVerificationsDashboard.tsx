import React, { useEffect, useState } from 'react';
import { useKycContext } from '../KycContext';
import { useKycActionHandlers } from '../KycActionHandlers';
import { toast } from 'sonner';
import KycDetailModal from '../modals/KycDetailModal';
import KycDashboardHeader from './KycDashboardHeader';
import KycDebugCard from './KycDebugCard';
import KycVerificationsContainer from './KycVerificationsContainer';
import { useQuery } from '@tanstack/react-query';
import { fetchKycVerifications, testDirectKycAccess, listAllUsersWithKycStatus } from '../KycVerificationsService';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
      try {
        const results = await fetchKycVerifications();
        console.log(`Fetched ${results.length} KYC verifications after RLS policy update`);
        
        if (results.length > 0) {
          console.log('First few KYC records:', results.slice(0, 3));
        } else {
          console.warn('WARNING: Still no KYC records returned after RLS policy update');
          
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
        
        console.log('KYC verification status counts after RLS update:', statusCounts);
        
        setLastFetchTime(new Date().toISOString());
        return results;
      } catch (err) {
        console.error('Error fetching KYC verifications after RLS update:', err);
        toast.error('Failed to fetch KYC verifications. Check console for details.');
        throw err;
      }
    },
    // More aggressive refetching settings
    refetchInterval: 3000, // Refresh every 3 seconds
    refetchOnWindowFocus: true,
    staleTime: 500, // Consider data stale after 500ms
  });
  
  // Query to fetch all users with KYC status for debugging
  const { 
    data: allUsersWithKyc = [], 
    refetch: refetchAllUsers 
  } = useQuery({
    queryKey: ['admin-all-users-kyc'],
    queryFn: listAllUsersWithKycStatus,
    enabled: showAllUsers,
  });
  
  const handleViewDetails = (kyc: typeof selectedKyc) => {
    console.log('Viewing KYC details:', kyc);
    setSelectedKyc(kyc);
    setRejectionReason('');
    setClarificationMessage('');
    setIsViewModalOpen(true);
  };
  
  const handleManualRefresh = async () => {
    console.log('Manual refresh triggered after RLS policy update');
    setManualRefreshCount(prev => prev + 1);
    
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
        toast.success(`Found ${directTest.count} KYC records with new RLS policies`);
      } else {
        toast.warning('No KYC records found even with updated RLS policies');
      }
    } catch (error) {
      console.error('Error in direct database test after RLS update:', error);
      toast.error('Error running direct database test');
    }
    
    // Standard refetch
    refetch();
    if (showAllUsers) refetchAllUsers();
    toast.success('Refreshing KYC data with new RLS policies...');
  };
  
  const toggleShowAllUsers = () => {
    const newState = !showAllUsers;
    setShowAllUsers(newState);
    if (newState) {
      refetchAllUsers();
    }
  };
  
  useEffect(() => {
    // Force immediate data fetch when component mounts to test new RLS policies
    console.log('KYC Verifications component mounted, fetching data with new RLS policies...');
    handleManualRefresh();
    
    // Clear messages when modal is closed
    if (!isViewModalOpen) {
      setRejectionReason('');
      setClarificationMessage('');
    }
    
    // Set up realtime subscription for KYC verifications with improved error handling
    console.log('Setting up realtime subscription for kyc_verifications table with new RLS policies...');
    const channel = supabase
      .channel('kyc-verification-updates-with-new-rls')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'kyc_verifications'
        },
        (payload) => {
          console.log('Realtime update received for kyc_verifications with new RLS:', payload);
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
        console.log('Realtime subscription status with new RLS:', status);
        
        if (status === 'SUBSCRIBED') {
          setRealtimeEnabled(true);
          console.log('✅ Successfully subscribed to realtime updates with new RLS policies');
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
  }, [isViewModalOpen, refetch, refetchAllUsers]);
  
  return (
    <div className="space-y-6">
      <KycDashboardHeader 
        onManualRefresh={handleManualRefresh}
        onDirectDatabaseTest={testResults => setDirectTestResults(testResults)}
        refetch={refetch}
        onToggleShowAllUsers={toggleShowAllUsers}
        showAllUsers={showAllUsers}
      />
      
      <KycDebugCard
        lastFetchTime={lastFetchTime}
        realtimeEnabled={realtimeEnabled}
        kycVerifications={kycVerifications}
        directTestResults={directTestResults}
        onRefresh={handleManualRefresh}
      />
      
      {showAllUsers && allUsersWithKyc.length > 0 && (
        <Card className="bg-slate-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">All Users with KYC Status</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-xs overflow-auto max-h-60">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-1">User ID</th>
                    <th className="text-left p-1">Name</th>
                    <th className="text-left p-1">KYC Status</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsersWithKyc.map(user => (
                    <tr key={user.id} className="border-b">
                      <td className="p-1 font-mono text-xs">{user.id}</td>
                      <td className="p-1">{user.first_name} {user.last_name}</td>
                      <td className="p-1">
                        <span className={
                          user.kyc_status === 'approved' ? 'text-green-600' :
                          user.kyc_status === 'pending' ? 'text-amber-600' :
                          user.kyc_status === 'rejected' ? 'text-red-600' :
                          'text-gray-600'
                        }>
                          {user.kyc_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
      
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


import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, CardContent, CardDescription, 
  CardHeader, CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, DatabaseIcon, BugIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

import { useKycContext } from './KycContext';
import { useKycActionHandlers } from './KycActionHandlers';
import { 
  fetchKycVerifications, 
  testDirectKycAccess,
  createTestKycRecord 
} from './KycVerificationsService';
import KycVerificationsTabs from './KycVerificationsTabs';
import KycDetailModal from './KycDetailModal';

const KycVerificationsDashboard: React.FC = () => {
  // Debug state to track query issues
  const [lastFetchTime, setLastFetchTime] = useState<string | null>(null);
  const [manualRefreshCount, setManualRefreshCount] = useState(0);
  const [realtimeEnabled, setRealtimeEnabled] = useState(false);
  const [directTestResults, setDirectTestResults] = useState<string | null>(null);
  
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
  
  // Handle view verification details
  const handleViewDetails = (kyc: typeof selectedKyc) => {
    console.log('Viewing KYC details:', kyc);
    setSelectedKyc(kyc);
    setRejectionReason('');
    setClarificationMessage('');
    setIsViewModalOpen(true);
  };
  
  // Force manual refresh
  const handleManualRefresh = () => {
    console.log('Manual refresh triggered');
    setManualRefreshCount(prev => prev + 1);
    refetch();
    toast.success('Refreshing KYC data...');
  };
  
  // Direct database test query
  const testDirectDatabaseQuery = async () => {
    try {
      console.log('Running direct database test query for KYC verifications...');
      
      const results = await testDirectKycAccess();
      
      setDirectTestResults(JSON.stringify(results, null, 2));
      
      toast.success(`Found ${results.count} KYC records (${results.pendingCount} pending)`);
      
      // If data exists but none shows in the dashboard, it's likely an RLS or query issue
      if (results.count > 0 && kycVerifications.length === 0) {
        console.warn('⚠️ Data exists in database but not showing in dashboard. Possible RLS or query issue.');
        toast.warning('Data exists but not showing in dashboard. Possible permissions issue.');
      }
      
      refetch(); // Refresh the dashboard data
    } catch (err) {
      console.error('Error in direct database test:', err);
      toast.error('Database test failed');
    }
  };
  
  // Create a test KYC record
  const handleCreateTestRecord = async () => {
    try {
      toast.info('Creating test KYC record...');
      const success = await createTestKycRecord();
      
      if (success) {
        toast.success('Created test KYC record');
        refetch();
      } else {
        toast.error('Failed to create test KYC record');
      }
    } catch (err) {
      console.error('Error creating test record:', err);
      toast.error('Failed to create test record');
    }
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
    
    // Set up realtime subscription for KYC verifications with increased logs
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
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cbis-blue"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-800 rounded-md">
        <h3 className="font-bold">Error loading KYC verifications</h3>
        <p>{(error as Error).message}</p>
        <Button onClick={() => refetch()} className="mt-4">
          <RefreshCw className="mr-2 h-4 w-4" />
          Retry
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold">KYC Verifications</h3>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={testDirectDatabaseQuery} 
            className="flex items-center gap-2"
          >
            <DatabaseIcon className="h-4 w-4" />
            Database Test
          </Button>
          <Button 
            variant="outline" 
            onClick={handleCreateTestRecord} 
            className="flex items-center gap-2"
          >
            <BugIcon className="h-4 w-4" />
            Create Test Record
          </Button>
          <Button 
            variant="outline" 
            onClick={() => { 
              setManualRefreshCount(prev => prev + 1); 
              refetch();
              toast.success('Refreshing KYC data...'); 
            }} 
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>
      
      {/* Debug Info */}
      <Card className="bg-slate-50">
        <CardContent className="pt-4">
          <div className="text-sm text-slate-500">
            <p><strong>Status:</strong> {realtimeEnabled ? '✅ Realtime enabled' : '❌ Realtime not connected'}</p>
            <p><strong>Last fetch:</strong> {lastFetchTime ? new Date(lastFetchTime).toLocaleTimeString() : 'Never'}</p>
            <p><strong>KYC records:</strong> {kycVerifications.length} total, {kycVerifications.filter(v => v.status === 'pending').length} pending</p>
            
            {directTestResults && (
              <div className="mt-2">
                <p><strong>Direct database test results:</strong></p>
                <pre className="bg-slate-100 p-2 rounded text-xs overflow-auto max-h-32">
                  {directTestResults}
                </pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cbis-blue"></div>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-50 text-red-800 rounded-md">
          <h3 className="font-bold">Error loading KYC verifications</h3>
          <p>{(error as Error).message}</p>
          <Button onClick={() => refetch()} className="mt-4">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>KYC Verification Requests</CardTitle>
            <CardDescription>
              Review and process KYC verification requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <KycVerificationsTabs
              kycVerifications={kycVerifications}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              onViewDetails={(kyc) => {
                console.log('Viewing KYC details:', kyc);
                setSelectedKyc(kyc);
                setRejectionReason('');
                setClarificationMessage('');
                setIsViewModalOpen(true);
              }}
            />
          </CardContent>
        </Card>
      )}
      
      {/* View/Process KYC Verification Modal */}
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

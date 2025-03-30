
import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, CardContent, CardDescription, 
  CardHeader, CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

import { useKycContext } from './KycContext';
import { useKycActionHandlers } from './KycActionHandlers';
import { fetchKycVerifications } from './KycVerificationsService';
import KycVerificationsTabs from './KycVerificationsTabs';
import KycDetailModal from './KycDetailModal';

const KycVerificationsDashboard: React.FC = () => {
  // Debug state to track query issues
  const [lastFetchTime, setLastFetchTime] = useState<string | null>(null);
  const [manualRefreshCount, setManualRefreshCount] = useState(0);
  const [realtimeEnabled, setRealtimeEnabled] = useState(false);
  
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
        const pendingCount = results.filter(v => v.status === 'pending').length;
        console.log(`Fetched ${results.length} KYC verifications (${pendingCount} pending)`);
        
        // Log the data for debugging
        if (pendingCount === 0) {
          console.log('No pending verifications found. All verifications:', results);
        } else {
          console.log('Pending verifications:', results.filter(v => v.status === 'pending'));
        }
        
        setLastFetchTime(new Date().toISOString());
        return results;
      } catch (err) {
        console.error('Error fetching KYC verifications:', err);
        throw err;
      }
    },
    refetchInterval: 30000, // Refresh every 30 seconds
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
      
      // Query all KYC verifications directly
      const { data, error: queryError, count } = await supabase
        .from('kyc_verifications')
        .select('*', { count: 'exact' });
      
      if (queryError) {
        console.error('Direct query error:', queryError);
        toast.error('Failed to query database directly');
        return;
      }
      
      // Count pending verifications
      const pendingCount = data?.filter(item => item.status === 'pending').length || 0;
      
      console.log(`Direct database query results: ${data?.length} total KYC records, ${pendingCount} pending`);
      console.log('First 5 records:', data?.slice(0, 5));
      
      toast.success(`Found ${data?.length} KYC records (${pendingCount} pending)`);
      
      // If data exists but none shows in the dashboard, it's likely an RLS or query issue
      if (data?.length && kycVerifications.length === 0) {
        console.warn('⚠️ Data exists in database but not showing in dashboard. Possible RLS or query issue.');
        toast.warning('Data exists but not showing in dashboard. Possible permissions issue.');
      }
      
      refetch(); // Refresh the dashboard data
    } catch (err) {
      console.error('Error in direct database test:', err);
      toast.error('Database test failed');
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
  
  // Log data for debugging
  useEffect(() => {
    if (kycVerifications) {
      console.log('KYC verifications data:', kycVerifications);
      console.log('Pending count:', kycVerifications.filter(v => v.status === 'pending').length);
    }
  }, [kycVerifications]);
  
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
            Test Database
          </Button>
          <Button 
            variant="outline" 
            onClick={handleManualRefresh} 
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
          </div>
        </CardContent>
      </Card>
      
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
            onViewDetails={handleViewDetails}
          />
        </CardContent>
      </Card>
      
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


import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, CardContent, CardDescription, 
  CardHeader, CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

import { useKycContext } from './KycContext';
import { useKycActionHandlers } from './KycActionHandlers';
import { fetchKycVerifications } from './KycVerificationsService';
import KycVerificationsTabs from './KycVerificationsTabs';
import KycDetailModal from './KycDetailModal';

const KycVerificationsDashboard: React.FC = () => {
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
    queryKey: ['admin-kyc-verifications'],
    queryFn: fetchKycVerifications,
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
  
  useEffect(() => {
    // Force refetch when component mounts to ensure fresh data
    console.log('KYC Verifications component mounted, fetching data...');
    refetch();
    
    // Clear messages when modal is closed
    if (!isViewModalOpen) {
      setRejectionReason('');
      setClarificationMessage('');
    }
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
        <Button variant="outline" onClick={() => refetch()} className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>
      
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

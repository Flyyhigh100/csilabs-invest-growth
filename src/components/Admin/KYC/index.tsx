
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Card, CardContent, CardDescription, 
  CardHeader, CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

import { fetchKycVerifications } from './KycVerificationsService';
import { KycVerificationWithProfile } from './types';
import KycVerificationsTabs from './KycVerificationsTabs';
import KycDetailModal from './KycDetailModal';
import { processKycVerification, requestKycClarification } from '@/utils/adminUtils';

// Main component for KYC verifications
const KycVerifications = () => {
  const queryClient = useQueryClient();
  const [selectedKyc, setSelectedKyc] = useState<KycVerificationWithProfile | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const [rejectionReason, setRejectionReason] = useState('');
  const [clarificationMessage, setClarificationMessage] = useState('');
  
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
  
  // Process KYC verification (approve or reject)
  const processMutation = useMutation({
    mutationFn: ({ 
      kycId, 
      status, 
      rejectionReason 
    }: { 
      kycId: string; 
      status: 'approved' | 'rejected'; 
      rejectionReason?: string;
    }) => {
      console.log('Processing KYC verification:', { kycId, status, rejectionReason });
      return processKycVerification(kycId, status, rejectionReason);
    },
    onSuccess: () => {
      setIsViewModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['admin-kyc-verifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
      toast.success(`KYC verification processed successfully`);
    },
    onError: (error) => {
      console.error('Error processing KYC verification:', error);
      toast.error('Failed to process KYC verification');
    },
  });
  
  // Request clarification from user
  const clarificationMutation = useMutation({
    mutationFn: ({ 
      kycId, 
      message 
    }: { 
      kycId: string; 
      message: string;
    }) => {
      console.log('Requesting clarification:', { kycId, message });
      return requestKycClarification(kycId, message);
    },
    onSuccess: () => {
      setIsViewModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['admin-kyc-verifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
      toast.success(`Clarification request sent successfully`);
    },
    onError: (error) => {
      console.error('Error sending clarification request:', error);
      toast.error('Failed to send clarification request');
    },
  });
  
  // Handle view verification details
  const handleViewDetails = (kyc: KycVerificationWithProfile) => {
    console.log('Viewing KYC details:', kyc);
    setSelectedKyc(kyc);
    setRejectionReason('');
    setClarificationMessage('');
    setIsViewModalOpen(true);
  };
  
  // Handle approve verification
  const handleApprove = () => {
    if (!selectedKyc) return;
    
    processMutation.mutate({
      kycId: selectedKyc.id,
      status: 'approved'
    });
  };
  
  // Handle reject verification
  const handleReject = () => {
    if (!selectedKyc || !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    
    processMutation.mutate({
      kycId: selectedKyc.id,
      status: 'rejected',
      rejectionReason: rejectionReason.trim()
    });
  };
  
  // Handle request clarification
  const handleRequestClarification = () => {
    if (!selectedKyc || !clarificationMessage.trim()) {
      toast.error('Please provide clarification details');
      return;
    }
    
    clarificationMutation.mutate({
      kycId: selectedKyc.id,
      message: clarificationMessage.trim()
    });
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
        onApprove={handleApprove}
        onReject={handleReject}
        onRequestClarification={handleRequestClarification}
        isPending={processMutation.isPending || clarificationMutation.isPending}
      />
    </div>
  );
};

export default KycVerifications;

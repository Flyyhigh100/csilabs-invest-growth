
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { KycVerificationWithProfile } from './types';
import { processKycVerification, requestKycClarification } from '@/utils/adminUtils';

export const useKycActionHandlers = (
  onSuccess: () => void
) => {
  const queryClient = useQueryClient();
  
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
      onSuccess();
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
      onSuccess();
      queryClient.invalidateQueries({ queryKey: ['admin-kyc-verifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
      toast.success(`Clarification request sent successfully`);
    },
    onError: (error) => {
      console.error('Error sending clarification request:', error);
      toast.error('Failed to send clarification request');
    },
  });

  // Handler functions
  const handleApprove = (selectedKyc: KycVerificationWithProfile | null) => {
    if (!selectedKyc) return;
    
    processMutation.mutate({
      kycId: selectedKyc.id,
      status: 'approved'
    });
  };
  
  const handleReject = (
    selectedKyc: KycVerificationWithProfile | null, 
    rejectionReason: string
  ) => {
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
  
  const handleRequestClarification = (
    selectedKyc: KycVerificationWithProfile | null,
    clarificationMessage: string
  ) => {
    if (!selectedKyc || !clarificationMessage.trim()) {
      toast.error('Please provide clarification details');
      return;
    }
    
    clarificationMutation.mutate({
      kycId: selectedKyc.id,
      message: clarificationMessage.trim()
    });
  };

  return {
    handleApprove,
    handleReject,
    handleRequestClarification,
    isPending: processMutation.isPending || clarificationMutation.isPending
  };
};

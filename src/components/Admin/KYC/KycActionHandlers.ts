
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { KycVerificationWithProfile } from './types';
import { processKycVerification, requestKycClarification } from '@/utils/admin/kyc/verification';

export const useKycActionHandlers = (
  onSuccess: () => void
) => {
  const queryClient = useQueryClient();
  
  // Process KYC verification (approve or reject)
  const processMutation = useMutation({
    mutationFn: async ({ 
      kycId, 
      status, 
      rejectionReason 
    }: { 
      kycId: string; 
      status: 'approved' | 'rejected'; 
      rejectionReason?: string;
    }) => {
      console.log('Processing KYC verification:', { kycId, status, rejectionReason });
      
      // Display immediate feedback
      const loadingToast = toast.loading(`Processing KYC verification...`);
      
      try {
        const success = await processKycVerification(kycId, status, rejectionReason);
        
        if (!success) {
          toast.dismiss(loadingToast);
          toast.error(`Failed to process KYC verification with status: ${status}`);
          throw new Error(`Failed to process KYC verification with status: ${status}`);
        }
        
        toast.dismiss(loadingToast);
        toast.success(`KYC verification ${status === 'approved' ? 'approved' : 'rejected'} successfully`);
        return true;
      } catch (error) {
        toast.dismiss(loadingToast);
        console.error('Error processing KYC verification:', error);
        toast.error(`Failed to process KYC verification: ${(error as Error).message}`);
        throw error;
      }
    },
    onSuccess: () => {
      // Run success callback first to close modal
      onSuccess();
      
      // Invalidate all relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['admin-kyc-verifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-all-users-kyc'] });
      
      // Force a more aggressive refetch of all KYC data
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['admin-kyc-verifications'] });
        queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
      }, 1000);
    }
  });
  
  // Request clarification from user
  const clarificationMutation = useMutation({
    mutationFn: async ({ 
      kycId, 
      message 
    }: { 
      kycId: string; 
      message: string;
    }) => {
      console.log('Requesting clarification:', { kycId, message });
      
      if (!message || message.trim() === '') {
        toast.error('Please provide a clarification message');
        throw new Error('Clarification message is required');
      }
      
      // Display immediate feedback
      const loadingToast = toast.loading(`Sending clarification request...`);
      
      try {
        const success = await requestKycClarification(kycId, message);
        
        if (!success) {
          toast.dismiss(loadingToast);
          toast.error('Failed to request clarification');
          throw new Error('Failed to request clarification');
        }
        
        toast.dismiss(loadingToast);
        toast.success(`Clarification request sent successfully`);
        return true;
      } catch (error) {
        toast.dismiss(loadingToast);
        console.error('Error sending clarification request:', error);
        toast.error(`Failed to send clarification request: ${(error as Error).message}`);
        throw error;
      }
    },
    onSuccess: () => {
      // Run success callback first to close modal
      onSuccess();
      
      // Invalidate all relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['admin-kyc-verifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-all-users-kyc'] });
      
      // Force a more aggressive refetch of all KYC data
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['admin-kyc-verifications'] });
        queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
      }, 1000);
    }
  });

  // Handler functions
  const handleApprove = (selectedKyc: KycVerificationWithProfile | null) => {
    if (!selectedKyc) {
      toast.error('No KYC record selected');
      return;
    }
    
    console.log('Approving KYC for:', selectedKyc.id);
    processMutation.mutate({
      kycId: selectedKyc.id,
      status: 'approved'
    });
  };
  
  const handleReject = (
    selectedKyc: KycVerificationWithProfile | null, 
    rejectionReason: string
  ) => {
    if (!selectedKyc) {
      toast.error('No KYC record selected');
      return;
    }
    
    if (!rejectionReason || !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    
    console.log('Rejecting KYC for:', selectedKyc.id, 'with reason:', rejectionReason);
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
    if (!selectedKyc) {
      toast.error('No KYC record selected');
      return;
    }
    
    if (!clarificationMessage || !clarificationMessage.trim()) {
      toast.error('Please provide clarification details');
      return;
    }
    
    console.log('Requesting clarification for:', selectedKyc.id, 'with message:', clarificationMessage);
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

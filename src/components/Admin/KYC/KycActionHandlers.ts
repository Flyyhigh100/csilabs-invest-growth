
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
      
      try {
        // Log the verification process for debugging
        console.log(`Starting verification process for KYC ID: ${kycId} with status: ${status}`);
        
        // Call the utility function to process the verification
        const success = await processKycVerification(kycId, status, rejectionReason);
        
        console.log(`Verification process completed with result: ${success ? 'SUCCESS' : 'FAILED'}`);
        
        if (!success) {
          throw new Error(`Failed to process KYC verification with status: ${status}`);
        }
        
        return true;
      } catch (error) {
        console.error('Error processing KYC verification:', error);
        throw error;
      }
    },
    onSuccess: () => {
      // Run success callback first to close modal
      onSuccess();
      
      // IMPORTANT: Invalidate all relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['admin-kyc-verifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-all-users-kyc'] });
      
      // Force a more aggressive refetch of all KYC data with a small delay to ensure
      // the database has been updated
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['admin-kyc-verifications'] });
        queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
      }, 1000);
    },
    onError: (error) => {
      console.error('Error in KYC mutation:', error);
      toast.error(`Failed to update KYC status: ${(error as Error).message}`, {
        duration: 5000
      });
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
      
      try {
        const success = await requestKycClarification(kycId, message);
        
        if (!success) {
          throw new Error('Failed to request clarification');
        }
        
        return true;
      } catch (error) {
        console.error('Error sending clarification request:', error);
        throw error;
      }
    },
    onSuccess: () => {
      // Run success callback first to close modal
      onSuccess();
      
      // IMPORTANT: Invalidate all relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['admin-kyc-verifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-all-users-kyc'] });
      
      // Force a more aggressive refetch with a delay to ensure the database has been updated
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['admin-kyc-verifications'] });
        queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
      }, 1000);
    },
    onError: (error) => {
      console.error('Error in clarification mutation:', error);
      toast.error(`Failed to send clarification request: ${(error as Error).message}`, {
        duration: 5000
      });
    }
  });

  // Handler functions
  const handleApprove = (selectedKyc: KycVerificationWithProfile | null) => {
    if (!selectedKyc) {
      toast.error('No KYC record selected');
      return;
    }
    
    console.log('Approving KYC for:', selectedKyc.id);
    toast.loading(`Approving KYC verification...`, {
      id: `approve-kyc-${selectedKyc.id}`
    });
    
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
    toast.loading(`Rejecting KYC verification...`, {
      id: `reject-kyc-${selectedKyc.id}`
    });
    
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
    toast.loading(`Sending clarification request...`, {
      id: `clarify-kyc-${selectedKyc.id}`
    });
    
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

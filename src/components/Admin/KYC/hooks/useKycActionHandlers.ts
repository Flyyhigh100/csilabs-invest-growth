
import { toast } from 'sonner';
import { KycVerificationWithProfile } from '../types';
import { useDebugInfo } from './useDebugInfo';
import { useProcessMutation } from './useProcessMutation';
import { useClarificationMutation } from './useClarificationMutation';
import { useKycQueryInvalidation } from './useKycQueryInvalidation';

/**
 * Main hook for KYC action handlers
 */
export const useKycActionHandlers = (onSuccess: () => void) => {
  // Debug info state management
  const { debugInfo, updateDebugInfo, resetDebugInfo } = useDebugInfo();
  
  // Query invalidation
  const { invalidateQueries } = useKycQueryInvalidation();
  
  // Process KYC verification (approve or reject)
  const processMutation = useProcessMutation(() => {
    // Run success callback first to close modal
    onSuccess();
    // Then invalidate queries to refresh data
    invalidateQueries();
  }, updateDebugInfo);
  
  // Request clarification from user
  const clarificationMutation = useClarificationMutation(() => {
    // Show success toast
    toast.success('Clarification request sent successfully', { duration: 5000 });
    
    // Run success callback to close modal
    onSuccess();
    
    // Invalidate queries to refresh data
    invalidateQueries();
  }, updateDebugInfo);

  // Handler functions
  const handleApprove = (selectedKyc: KycVerificationWithProfile | null) => {
    if (!selectedKyc) {
      toast.error('No KYC record selected');
      return;
    }
    
    console.log('🚀 Approving KYC for:', selectedKyc.id);
    
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
    
    console.log('🚀 Rejecting KYC for:', selectedKyc.id, 'with reason:', rejectionReason);
    
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
    
    console.log('🚀 Requesting clarification for:', selectedKyc.id, 'with message:', clarificationMessage);
    
    clarificationMutation.mutate({
      kycId: selectedKyc.id,
      message: clarificationMessage.trim()
    });
  };

  return {
    handleApprove,
    handleReject,
    handleRequestClarification,
    isPending: processMutation.isPending || clarificationMutation.isPending,
    debugInfo,
    resetDebugInfo
  };
};

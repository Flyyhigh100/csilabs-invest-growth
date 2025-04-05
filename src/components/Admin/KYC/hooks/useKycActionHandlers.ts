
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { KycVerificationWithProfile } from '../types';
import { processKycVerification, requestKycClarification } from '@/utils/admin/kyc/verification';
import { useState } from 'react';

/**
 * Debug information state hook
 */
export const useDebugInfo = () => {
  return useState<{
    lastActionType: string | null;
    lastActionTimestamp: string | null;
    supabaseTriggered: boolean;
    supabaseResponse: any | null;
    error: string | null;
    retryAttempts: number;
    currentRetry: number | null;
    adminPermissionStatus: 'verified' | 'failed' | 'checking' | null;
  }>({
    lastActionType: null,
    lastActionTimestamp: null,
    supabaseTriggered: false,
    supabaseResponse: null,
    error: null,
    retryAttempts: 3,
    currentRetry: null,
    adminPermissionStatus: null
  });
};

/**
 * Query invalidation hook
 */
export const useKycQueryInvalidation = () => {
  const queryClient = useQueryClient();
  
  return () => {
    console.log('🔄 Invalidating all KYC-related queries');
    
    // Immediately invalidate all related queries
    queryClient.invalidateQueries({ queryKey: ['admin-kyc-verifications'] });
    queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
    queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    queryClient.invalidateQueries({ queryKey: ['admin-all-users-kyc'] });
    
    // Force a more aggressive refetch with a delay
    setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ['admin-kyc-verifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
    }, 1000);
  };
};

/**
 * Process mutation hook for approving/rejecting KYC
 */
export const useProcessMutation = (onSuccess: () => void, setDebugInfo: any) => {
  const invalidateQueries = useKycQueryInvalidation();
  
  return useMutation({
    mutationFn: async ({ 
      kycId, 
      status, 
      rejectionReason 
    }: { 
      kycId: string; 
      status: 'approved' | 'rejected'; 
      rejectionReason?: string;
    }) => {
      console.log('🚀 Starting KYC verification process:', { kycId, status, rejectionReason });
      
      // Clear previous error state
      setDebugInfo(prev => ({
        ...prev,
        error: null
      }));
      
      // Update debug info at the start
      setDebugInfo(prev => ({
        ...prev,
        lastActionType: status,
        lastActionTimestamp: new Date().toISOString(),
        supabaseTriggered: true,
        supabaseResponse: null,
        error: null,
        retryAttempts: 3,
        currentRetry: 0,
        adminPermissionStatus: 'checking'
      }));
      
      // Validation for rejection reason if status is 'rejected'
      if (status === 'rejected' && (!rejectionReason || rejectionReason.trim() === '')) {
        const errorMsg = 'Rejection reason is required';
        console.error(errorMsg);
        setDebugInfo(prev => ({
          ...prev,
          error: errorMsg,
          supabaseTriggered: false
        }));
        
        throw new Error(errorMsg);
      }
      
      try {
        // Set up an event listener for the retry attempts
        const retryListener = (attemptNum: number | null, maxRetries: number | null) => {
          console.log(`Retry attempt ${attemptNum} of ${maxRetries}`);
          setDebugInfo(prev => ({
            ...prev,
            currentRetry: attemptNum,
            retryAttempts: maxRetries || prev.retryAttempts
          }));
        };
        
        // Set up a listener for admin permission check
        const adminPermissionListener = (status: 'verified' | 'failed' | 'checking') => {
          console.log(`Admin permission check: ${status}`);
          setDebugInfo(prev => ({
            ...prev,
            adminPermissionStatus: status
          }));
        };
        
        // Register these listeners globally
        (window as any).kycRetryListener = retryListener;
        (window as any).kycAdminPermissionListener = adminPermissionListener;
        
        console.log(`📤 Sending request to Supabase for KYC ID: ${kycId} with status: ${status}`);
        const success = await processKycVerification(kycId, status, rejectionReason);
        
        console.log(`✅ Verification process completed with result: ${success ? 'SUCCESS' : 'FAILED'}`);
        
        if (!success) {
          const errorMessage = `Failed to process KYC verification with status: ${status}`;
          console.error(errorMessage);
          
          setDebugInfo(prev => ({
            ...prev,
            supabaseTriggered: true,
            supabaseResponse: { success: false },
            error: errorMessage,
            currentRetry: null
          }));
          
          throw new Error(errorMessage);
        }
        
        // Update debug info with success
        setDebugInfo(prev => ({
          ...prev,
          supabaseTriggered: true,
          supabaseResponse: { success: true, status },
          currentRetry: null
        }));
        
        return true;
      } catch (error) {
        console.error('❌ Error processing KYC verification:', error);
        
        setDebugInfo(prev => ({
          ...prev,
          supabaseTriggered: true,
          supabaseResponse: null,
          error: (error as Error).message,
          currentRetry: null
        }));
        
        throw error;
      } finally {
        // Clean up the global listeners
        delete (window as any).kycRetryListener;
        delete (window as any).kycAdminPermissionListener;
      }
    },
    onSuccess: () => {
      // Run success callback first to close modal
      onSuccess();
      
      // Invalidate all relevant queries to refresh data
      invalidateQueries();
    },
    onError: (error) => {
      console.error('❌ Error in KYC mutation:', error);
      toast.error(`Failed to update KYC status: ${(error as Error).message}`);
    }
  });
};

/**
 * Clarification mutation hook
 */
export const useClarificationMutation = (onSuccess: () => void, setDebugInfo: any) => {
  const invalidateQueries = useKycQueryInvalidation();
  
  return useMutation({
    mutationFn: async ({ 
      kycId, 
      message 
    }: { 
      kycId: string; 
      message: string;
    }) => {
      console.log('🚀 Starting clarification request:', { kycId, message });
      
      // Update debug info at the start
      setDebugInfo(prev => ({
        ...prev,
        lastActionType: 'clarification',
        lastActionTimestamp: new Date().toISOString(),
        supabaseTriggered: true,
        supabaseResponse: null,
        error: null,
        retryAttempts: 3,
        currentRetry: 0,
        adminPermissionStatus: 'checking'
      }));
      
      if (!message || message.trim() === '') {
        const errorMessage = 'Clarification message is required';
        console.error(errorMessage);
        
        setDebugInfo(prev => ({
          ...prev,
          error: errorMessage
        }));
        
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }
      
      try {
        // Set up an event listener for the retry attempts
        const retryListener = (attemptNum: number | null, maxRetries: number | null) => {
          console.log(`Clarification retry attempt ${attemptNum} of ${maxRetries}`);
          setDebugInfo(prev => ({
            ...prev,
            currentRetry: attemptNum,
            retryAttempts: maxRetries || prev.retryAttempts
          }));
        };
        
        // Set up a listener for admin permission check
        const adminPermissionListener = (status: 'verified' | 'failed' | 'checking') => {
          console.log(`Admin permission check for clarification: ${status}`);
          setDebugInfo(prev => ({
            ...prev,
            adminPermissionStatus: status
          }));
        };
        
        // Register these listeners globally
        (window as any).kycRetryListener = retryListener;
        (window as any).kycAdminPermissionListener = adminPermissionListener;
        
        console.log(`📤 Sending clarification request to Supabase for KYC ID: ${kycId}`);
        const success = await requestKycClarification(kycId, message);
        
        console.log(`✅ Clarification request completed with result: ${success ? 'SUCCESS' : 'FAILED'}`);
        
        if (!success) {
          const errorMessage = 'Failed to request clarification';
          console.error(errorMessage);
          
          setDebugInfo(prev => ({
            ...prev,
            supabaseTriggered: true,
            supabaseResponse: { success: false },
            error: errorMessage,
            currentRetry: null
          }));
          
          toast.error(errorMessage, { duration: 5000 });
          throw new Error(errorMessage);
        }
        
        // Update debug info with success
        setDebugInfo(prev => ({
          ...prev,
          supabaseTriggered: true,
          supabaseResponse: { success: true, status: 'needs_clarification' },
          currentRetry: null
        }));
        
        return true;
      } catch (error) {
        console.error('❌ Error sending clarification request:', error);
        
        setDebugInfo(prev => ({
          ...prev,
          supabaseTriggered: true,
          supabaseResponse: null,
          error: (error as Error).message,
          currentRetry: null
        }));
        
        throw error;
      } finally {
        // Clean up the global listeners
        delete (window as any).kycRetryListener;
        delete (window as any).kycAdminPermissionListener;
      }
    },
    onSuccess: () => {
      // Show success toast
      toast.success('Clarification request sent successfully', { duration: 5000 });
      
      // Run success callback to close modal
      onSuccess();
      
      // Invalidate all relevant queries
      invalidateQueries();
    },
    onError: (error) => {
      console.error('❌ Error in clarification mutation:', error);
      toast.error(`Failed to send clarification request: ${(error as Error).message}`, {
        duration: 5000
      });
    }
  });
};

/**
 * Main hook for KYC action handlers
 */
export const useKycActionHandlers = (onSuccess: () => void) => {
  const [debugInfo, setDebugInfo] = useDebugInfo();
  const processMutation = useProcessMutation(onSuccess, setDebugInfo);
  const clarificationMutation = useClarificationMutation(onSuccess, setDebugInfo);

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
    debugInfo
  };
};

export default useKycActionHandlers;

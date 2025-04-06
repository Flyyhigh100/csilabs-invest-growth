import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { KycVerificationWithProfile } from '../types';
import { processKycVerification, requestKycClarification } from '@/utils/admin/kyc/verification';
import { useState } from 'react';
import React from 'react';

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
    console.log('🔄 Invalidating KYC-related queries');
    
    // Single invalidation with proper refetch behavior
    queryClient.invalidateQueries({ 
      queryKey: ['admin-kyc-verifications'],
      refetchType: 'active'
    });
    
    queryClient.invalidateQueries({ 
      queryKey: ['admin-dashboard-stats'],
      refetchType: 'active'
    });
    
    queryClient.invalidateQueries({ 
      queryKey: ['admin-users'],
      refetchType: 'active'
    });
    
    queryClient.invalidateQueries({ 
      queryKey: ['admin-all-users-kyc'],
      refetchType: 'active'
    });
  };
};

/**
 * Process mutation hook for approving/rejecting KYC
 */
export const useProcessMutation = (onSuccess: () => void, setDebugInfo: any) => {
  const invalidateQueries = useKycQueryInvalidation();
  const queryClient = useQueryClient();
  
  // Track if mutation is in progress
  const [isMutating, setIsMutating] = React.useState(false);
  
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
      // Prevent multiple simultaneous mutations
      if (isMutating) {
        console.log('Mutation already in progress, skipping');
        return false;
      }
      
      setIsMutating(true);
      
      // Clear any existing error state and toasts
      toast.dismiss();
      setDebugInfo(prev => ({
        ...prev,
        error: null,
        lastActionType: status,
        lastActionTimestamp: new Date().toISOString(),
        supabaseTriggered: true,
        supabaseResponse: null,
        currentRetry: 0,
        adminPermissionStatus: 'checking'
      }));

      try {
        const success = await processKycVerification(kycId, status, rejectionReason);
        if (!success) {
          throw new Error('KYC verification failed');
        }
        
        // Immediately update the optimistic UI state
        queryClient.setQueryData(['admin-kyc-verifications'], (oldData: any) => {
          if (!oldData?.pages) return oldData;
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              data: page.data.map((item: any) => 
                item.id === kycId ? { ...item, status } : item
              )
            }))
          };
        });
        
        return success;
      } catch (error) {
        console.error('Error in mutation:', error);
        // Clear any lingering loading states
        toast.dismiss();
        toast.error(`Error: ${(error as Error).message}`);
        
        setDebugInfo(prev => ({
          ...prev,
          error: (error as Error).message,
          supabaseTriggered: false,
          currentRetry: null,
          adminPermissionStatus: 'failed'
        }));
        throw error;
      } finally {
        // Always release the mutation lock
        setTimeout(() => {
          setIsMutating(false);
        }, 1000);
      }
    },
    onSuccess: () => {
      // Clear any lingering loading states
      toast.dismiss();
      
      // Run success callback first
      onSuccess();
      
      // Then invalidate queries
      invalidateQueries();
      
      // Reset debug info
      setDebugInfo(prev => ({
        ...prev,
        lastActionType: null,
        lastActionTimestamp: null,
        supabaseTriggered: false,
        supabaseResponse: null,
        error: null,
        currentRetry: null,
        adminPermissionStatus: null
      }));
      
      // Release the mutation lock
      setIsMutating(false);
    },
    onError: (error) => {
      // Clear any lingering loading states
      toast.dismiss();
      
      console.error('Error in KYC mutation:', error);
      
      // Reset debug info on error
      setDebugInfo(prev => ({
        ...prev,
        lastActionType: null,
        lastActionTimestamp: null,
        supabaseTriggered: false,
        supabaseResponse: null,
        error: (error as Error).message,
        currentRetry: null,
        adminPermissionStatus: 'failed'
      }));
      
      // Release the mutation lock
      setIsMutating(false);
    }
  });
  
  return processMutation;
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
      // Generate an operation ID for tracking
      const operationId = `clarify-${Date.now()}`;
      console.log(`[${operationId}] 🚀 Starting clarification request:`, { kycId, message });
      
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
        console.error(`[${operationId}] ${errorMessage}`);
        
        setDebugInfo(prev => ({
          ...prev,
          error: errorMessage
        }));
        
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }
      
      try {
        // Set up a timeout to automatically clear the pending state
        const safetyTimeout = setTimeout(() => {
          console.log(`⏰ [${operationId}] Safety timeout triggered after 30 seconds`);
          setDebugInfo(prev => ({
            ...prev,
            error: 'Operation timed out after 30 seconds',
            currentRetry: null
          }));
          
          toast.dismiss('clarify-processing-toast');
          toast.error('Operation timed out. Please check network connection and try again.');
        }, 30000); // 30 seconds timeout
        
        // Set up listeners similar to process mutation
        const retryListener = (attemptNum: number | null, maxRetries: number | null) => {
          console.log(`[${operationId}] Clarification retry attempt ${attemptNum} of ${maxRetries}`);
          setDebugInfo(prev => ({
            ...prev,
            currentRetry: attemptNum,
            retryAttempts: maxRetries || prev.retryAttempts
          }));
        };
        
        const adminPermissionListener = (status: 'verified' | 'failed' | 'checking') => {
          console.log(`[${operationId}] Admin permission check for clarification: ${status}`);
          setDebugInfo(prev => ({
            ...prev,
            adminPermissionStatus: status
          }));
        };
        
        // Register these listeners globally
        (window as any).kycRetryListener = retryListener;
        (window as any).kycAdminPermissionListener = adminPermissionListener;
        
        console.log(`[${operationId}] 📤 Sending clarification request to Supabase for KYC ID: ${kycId}`);
        const success = await requestKycClarification(kycId, message);
        
        // Clear the safety timeout
        clearTimeout(safetyTimeout);
        toast.dismiss('clarify-processing-toast');
        
        console.log(`[${operationId}] ✅ Clarification request completed with result: ${success ? 'SUCCESS' : 'FAILED'}`);
        
        if (!success) {
          const errorMessage = 'Failed to request clarification';
          console.error(`[${operationId}] ${errorMessage}`);
          
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
        
        // Trigger immediate invalidation
        invalidateQueries();
        
        return true;
      } catch (error) {
        console.error(`[${operationId}] ❌ Error sending clarification request:`, error);
        
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

  // Action handlers
  const handleApprove = (selectedKyc: KycVerificationWithProfile | null) => {
    if (!selectedKyc) {
      toast.error('No KYC record selected');
      return;
    }
    
    // Clear ALL existing toasts before starting
    toast.dismiss();
    
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
    
    // Clear ALL existing toasts before starting
    toast.dismiss();
    
    processMutation.mutate({
      kycId: selectedKyc.id,
      status: 'rejected',
      rejectionReason: rejectionReason.trim()
    });
  };
  
  const handleRequestClarification = (
    selectedKyc: KycVerificationWithProfile | null,
    message: string
  ) => {
    if (!selectedKyc) {
      toast.error('No KYC record selected');
      return;
    }
    
    if (!message || !message.trim()) {
      toast.error('Please provide a clarification message');
      return;
    }
    
    console.log('🚀 Requesting clarification for KYC:', selectedKyc.id, 'with message:', message);
    
    // Clear ALL existing toasts before starting
    toast.dismiss();
    
    // Create a unique ID for this toast
    const loadingToastId = `clarification-${selectedKyc.id}-${Date.now()}`;
    
    // Show a loading toast
    toast.loading('Processing clarification request...', { 
      id: loadingToastId,
      duration: 10000
    });
    
    clarificationMutation.mutate({
      kycId: selectedKyc.id,
      message: message.trim()
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

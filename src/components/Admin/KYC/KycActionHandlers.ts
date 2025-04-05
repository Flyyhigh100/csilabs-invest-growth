import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { KycVerificationWithProfile } from './types';
import { processKycVerification, requestKycClarification } from '@/utils/admin/kyc/verification';
import { useState } from 'react';

export const useKycActionHandlers = (
  onSuccess: () => void
) => {
  const queryClient = useQueryClient();
  const [debugInfo, setDebugInfo] = useState<{
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
    retryAttempts: 0,
    currentRetry: null,
    adminPermissionStatus: null
  });
  
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
      console.log('🚀 Starting KYC verification process:', { kycId, status, rejectionReason });
      
      // Update debug info at the start
      setDebugInfo(prev => ({
        ...prev,
        lastActionType: status,
        lastActionTimestamp: new Date().toISOString(),
        supabaseTriggered: true,
        supabaseResponse: null,
        error: null,
        retryAttempts: 0,
        currentRetry: 0,
        adminPermissionStatus: 'checking'
      }));
      
      try {
        // Call the utility function to process the verification
        console.log(`📤 Sending request to Supabase for KYC ID: ${kycId} with status: ${status}`);
        
        // Set up an event listener for the retry attempts
        const retryListener = (attemptNum: number, maxRetries: number) => {
          console.log(`Retry attempt ${attemptNum} of ${maxRetries}`);
          setDebugInfo(prev => ({
            ...prev,
            currentRetry: attemptNum,
            retryAttempts: maxRetries
          }));
        };
        
        // Set up a listener for admin permission check
        const adminPermissionListener = (status: 'verified' | 'failed') => {
          console.log(`Admin permission check: ${status}`);
          setDebugInfo(prev => ({
            ...prev,
            adminPermissionStatus: status
          }));
        };
        
        // Register these listeners globally so they can be called from verification.ts
        (window as any).kycRetryListener = retryListener;
        (window as any).kycAdminPermissionListener = adminPermissionListener;
        
        const success = await processKycVerification(kycId, status, rejectionReason);
        
        console.log(`✅ Verification process completed with result: ${success ? 'SUCCESS' : 'FAILED'}`);
        
        if (!success) {
          const errorMessage = `Failed to process KYC verification with status: ${status}`;
          console.error(errorMessage);
          
          // Update debug info with error
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
        
        toast.success(`KYC verification ${status} successfully`);
        
        return true;
      } catch (error) {
        console.error('❌ Error processing KYC verification:', error);
        
        // Update debug info with error
        setDebugInfo(prev => ({
          ...prev,
          supabaseTriggered: true,
          supabaseResponse: null,
          error: (error as Error).message,
          currentRetry: null
        }));
        
        toast.error(`Failed to process KYC: ${(error as Error).message}`);
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
      
      // IMPORTANT: Invalidate all relevant queries to refresh data
      console.log('🔄 Invalidating queries to refresh data after successful KYC update');
      queryClient.invalidateQueries({ queryKey: ['admin-kyc-verifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-all-users-kyc'] });
      
      // Force a more aggressive refetch of all KYC data with a small delay to ensure
      // the database has been updated
      setTimeout(() => {
        console.log('🔄 Performing delayed refetch of KYC data');
        queryClient.invalidateQueries({ queryKey: ['admin-kyc-verifications'] });
        queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
      }, 1000);
    },
    onError: (error) => {
      console.error('❌ Error in KYC mutation:', error);
      toast.error(`Failed to update KYC status: ${(error as Error).message}`);
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
      console.log('🚀 Starting clarification request:', { kycId, message });
      
      // Update debug info at the start
      setDebugInfo(prev => ({
        ...prev,
        lastActionType: 'clarification',
        lastActionTimestamp: new Date().toISOString(),
        supabaseTriggered: true,
        supabaseResponse: null,
        error: null,
        retryAttempts: 0,
        currentRetry: 0,
        adminPermissionStatus: 'checking'
      }));
      
      if (!message || message.trim() === '') {
        const errorMessage = 'Clarification message is required';
        console.error(errorMessage);
        
        // Update debug info with error
        setDebugInfo(prev => ({
          ...prev,
          error: errorMessage
        }));
        
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }
      
      try {
        // Set up an event listener for the retry attempts
        const retryListener = (attemptNum: number, maxRetries: number) => {
          console.log(`Clarification retry attempt ${attemptNum} of ${maxRetries}`);
          setDebugInfo(prev => ({
            ...prev,
            currentRetry: attemptNum,
            retryAttempts: maxRetries
          }));
        };
        
        // Set up a listener for admin permission check
        const adminPermissionListener = (status: 'verified' | 'failed') => {
          console.log(`Admin permission check for clarification: ${status}`);
          setDebugInfo(prev => ({
            ...prev,
            adminPermissionStatus: status
          }));
        };
        
        // Register these listeners globally so they can be called from verification.ts
        (window as any).kycRetryListener = retryListener;
        (window as any).kycAdminPermissionListener = adminPermissionListener;
        
        console.log(`📤 Sending clarification request to Supabase for KYC ID: ${kycId}`);
        const success = await requestKycClarification(kycId, message);
        
        console.log(`✅ Clarification request completed with result: ${success ? 'SUCCESS' : 'FAILED'}`);
        
        if (!success) {
          const errorMessage = 'Failed to request clarification';
          console.error(errorMessage);
          
          // Update debug info with error
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
        
        // Update debug info with error
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
      
      // IMPORTANT: Invalidate all relevant queries to refresh data
      console.log('🔄 Invalidating queries to refresh data after successful clarification request');
      queryClient.invalidateQueries({ queryKey: ['admin-kyc-verifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-all-users-kyc'] });
      
      // Force a more aggressive refetch with a delay to ensure the database has been updated
      setTimeout(() => {
        console.log('🔄 Performing delayed refetch of KYC data');
        queryClient.invalidateQueries({ queryKey: ['admin-kyc-verifications'] });
        queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
      }, 1000);
    },
    onError: (error) => {
      console.error('❌ Error in clarification mutation:', error);
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

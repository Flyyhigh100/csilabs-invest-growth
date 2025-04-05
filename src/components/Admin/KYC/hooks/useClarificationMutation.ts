
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { requestKycClarification } from '@/utils/admin/kyc/verification';

/**
 * Hook for KYC clarification request mutation
 */
export const useClarificationMutation = (
  onSuccess: () => void, 
  updateDebugInfo: (updates: any) => void
) => {
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
      updateDebugInfo({
        lastActionType: 'clarification',
        lastActionTimestamp: new Date().toISOString(),
        supabaseTriggered: true,
        supabaseResponse: null,
        error: null,
        retryAttempts: 0,
        currentRetry: 0,
        adminPermissionStatus: 'checking'
      });
      
      if (!message || message.trim() === '') {
        const errorMessage = 'Clarification message is required';
        console.error(errorMessage);
        
        // Update debug info with error
        updateDebugInfo({
          error: errorMessage
        });
        
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }
      
      try {
        // Set up an event listener for the retry attempts
        const retryListener = (attemptNum: number, maxRetries: number) => {
          console.log(`Clarification retry attempt ${attemptNum} of ${maxRetries}`);
          updateDebugInfo({
            currentRetry: attemptNum,
            retryAttempts: maxRetries
          });
        };
        
        // Set up a listener for admin permission check
        const adminPermissionListener = (status: 'verified' | 'failed') => {
          console.log(`Admin permission check for clarification: ${status}`);
          updateDebugInfo({
            adminPermissionStatus: status
          });
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
          updateDebugInfo({
            supabaseTriggered: true,
            supabaseResponse: { success: false },
            error: errorMessage,
            currentRetry: null
          });
          
          toast.error(errorMessage, { duration: 5000 });
          throw new Error(errorMessage);
        }
        
        // Update debug info with success
        updateDebugInfo({
          supabaseTriggered: true,
          supabaseResponse: { success: true, status: 'needs_clarification' },
          currentRetry: null
        });
        
        return true;
      } catch (error) {
        console.error('❌ Error sending clarification request:', error);
        
        // Update debug info with error
        updateDebugInfo({
          supabaseTriggered: true,
          supabaseResponse: null,
          error: (error as Error).message,
          currentRetry: null
        });
        
        throw error;
      } finally {
        // Clean up the global listeners
        delete (window as any).kycRetryListener;
        delete (window as any).kycAdminPermissionListener;
      }
    },
    onSuccess,
    onError: (error) => {
      console.error('❌ Error in clarification mutation:', error);
      toast.error(`Failed to send clarification request: ${(error as Error).message}`, {
        duration: 5000
      });
    }
  });
};


import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { processKycVerification } from '@/utils/admin/kyc/verification';

/**
 * Hook for KYC verification processing mutation
 */
export const useProcessMutation = (
  onSuccess: () => void, 
  updateDebugInfo: (updates: any) => void
) => {
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
      updateDebugInfo({
        error: null
      });
      
      // Update debug info at the start
      updateDebugInfo({
        lastActionType: status,
        lastActionTimestamp: new Date().toISOString(),
        supabaseTriggered: true,
        supabaseResponse: null,
        error: null,
        retryAttempts: 0,
        currentRetry: 0,
        adminPermissionStatus: 'checking'
      });
      
      // Validation for rejection reason if status is 'rejected'
      if (status === 'rejected' && (!rejectionReason || rejectionReason.trim() === '')) {
        const errorMsg = 'Rejection reason is required';
        console.error(errorMsg);
        updateDebugInfo({
          error: errorMsg,
          supabaseTriggered: false
        });
        
        throw new Error(errorMsg);
      }
      
      try {
        // Set up an event listener for the retry attempts
        const retryListener = (attemptNum: number | null, maxRetries: number | null) => {
          console.log(`Retry attempt ${attemptNum} of ${maxRetries}`);
          updateDebugInfo({
            currentRetry: attemptNum,
            retryAttempts: maxRetries || 0
          });
        };
        
        // Set up a listener for admin permission check
        const adminPermissionListener = (status: 'verified' | 'failed' | 'checking') => {
          console.log(`Admin permission check: ${status}`);
          updateDebugInfo({
            adminPermissionStatus: status
          });
        };
        
        // Register these listeners globally so they can be called from verification.ts
        (window as any).kycRetryListener = retryListener;
        (window as any).kycAdminPermissionListener = adminPermissionListener;
        
        console.log(`📤 Sending request to Supabase for KYC ID: ${kycId} with status: ${status}`);
        const success = await processKycVerification(kycId, status, rejectionReason);
        
        console.log(`✅ Verification process completed with result: ${success ? 'SUCCESS' : 'FAILED'}`);
        
        if (!success) {
          const errorMessage = `Failed to process KYC verification with status: ${status}`;
          console.error(errorMessage);
          
          // Update debug info with error
          updateDebugInfo({
            supabaseTriggered: true,
            supabaseResponse: { success: false },
            error: errorMessage,
            currentRetry: null
          });
          
          throw new Error(errorMessage);
        }
        
        // Update debug info with success
        updateDebugInfo({
          supabaseTriggered: true,
          supabaseResponse: { success: true, status },
          currentRetry: null
        });
        
        return true;
      } catch (error) {
        console.error('❌ Error processing KYC verification:', error);
        
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
      console.error('❌ Error in KYC mutation:', error);
      toast.error(`Failed to update KYC status: ${(error as Error).message}`);
    }
  });
};


import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { submitKycVerification } from '../services/verificationService';

/**
 * Hook for submitting KYC verification
 */
export function useVerificationSubmitMutation() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Submit KYC verification
  const submitVerification = useMutation({
    mutationFn: async (kycData: any) => {
      if (!user) {
        console.error('User not authenticated');
        throw new Error('User not authenticated or KYC data not found');
      }
      
      console.log('Submitting verification for user:', user.id);
      
      // Add additional validation
      if (!kycData.id_front_url || !kycData.id_back_url || !kycData.selfie_url) {
        console.error('Missing required document uploads');
        throw new Error('All documents must be uploaded before submission');
      }
      
      // Proceed with submission
      const result = await submitKycVerification(user.id);
      console.log("Submission result:", result);
      return result;
    },
    onSuccess: () => {
      console.log("KYC verification submitted successfully");
      toast.success("Verification submitted successfully! We will review it shortly.");
      
      // Force immediate invalidation of all related cached data
      queryClient.invalidateQueries({ queryKey: ['kyc', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['admin-kyc-verifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-all-users-kyc'] });
    },
    onError: (error) => {
      console.error('Error submitting verification:', error);
      toast.error(`Failed to submit verification: ${error instanceof Error ? error.message : 'Please try again.'}`);
    }
  });

  return { submitVerification };
}

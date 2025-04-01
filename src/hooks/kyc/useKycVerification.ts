
import { useAuth } from '@/contexts/AuthContext';
import { useKycData } from './hooks/useKycData';
import { usePersonalInfoMutation } from './hooks/usePersonalInfoMutation';
import { useDocumentUploadMutation } from './hooks/useDocumentUploadMutation';
import { useVerificationSubmitMutation } from './hooks/useVerificationSubmitMutation';

/**
 * Main hook that combines all KYC functionality.
 * This hook delegates to specialized hooks for different operations
 * while maintaining the same API surface for backward compatibility.
 */
export function useKycVerification() {
  const { user } = useAuth();
  
  // Use the specialized hooks
  const { kycData, isLoading, error, refetch, runStorageCheck } = useKycData();
  const { savePersonalInfo } = usePersonalInfoMutation();
  const { uploadDocument } = useDocumentUploadMutation();
  const { submitVerification: submitVerificationMutation } = useVerificationSubmitMutation();
  
  // Create a wrapper for the submit verification to ensure it has access to kycData
  const submitVerification = {
    ...submitVerificationMutation,
    mutateAsync: async () => {
      if (!kycData) {
        throw new Error('KYC data not found');
      }
      return await submitVerificationMutation.mutateAsync(kycData);
    }
  };
  
  return {
    kycData,
    isLoading,
    error,
    savePersonalInfo,
    uploadDocument,
    submitVerification,
    refetch,
    runStorageCheck
  };
}

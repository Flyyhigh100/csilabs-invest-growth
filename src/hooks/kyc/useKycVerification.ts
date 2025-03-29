
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { 
  KycVerificationData, 
  KycFormData 
} from './types';
import {
  fetchKycVerification,
  saveKycPersonalInfo,
  uploadKycDocument,
  submitKycVerification
} from './kycService';

export function useKycVerification() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Fetch KYC verification data
  const {
    data: kycData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['kyc', user?.id],
    queryFn: async (): Promise<KycVerificationData | null> => {
      if (!user) return null;
      console.log('Fetching KYC data for user:', user.id);
      return fetchKycVerification(user.id);
    },
    enabled: !!user,
    staleTime: 0, // Always refetch when needed
    refetchOnWindowFocus: true,
  });
  
  // Save KYC personal information
  const savePersonalInfo = useMutation({
    mutationFn: async (formData: KycFormData) => {
      if (!user || !kycData) throw new Error('User not authenticated or KYC data not found');
      console.log('Saving personal info for user:', user.id);
      return saveKycPersonalInfo(user.id, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kyc', user?.id] });
      refetch();
      toast.success('Personal information saved successfully');
    },
    onError: (error) => {
      console.error('Error saving personal information:', error);
      toast.error('Failed to save personal information');
    }
  });
  
  // Upload document (ID front, ID back, selfie)
  const uploadDocument = useMutation({
    mutationFn: async ({ 
      file, 
      type 
    }: { 
      file: File, 
      type: 'id_front' | 'id_back' | 'selfie' 
    }) => {
      if (!user) throw new Error('User not authenticated');
      console.log(`Uploading ${type} document for user:`, user.id);
      return uploadKycDocument(user.id, file, type);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kyc', user?.id] });
      refetch();
    },
    onError: (error) => {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document');
    }
  });
  
  // Submit KYC verification
  const submitVerification = useMutation({
    mutationFn: async () => {
      if (!user || !kycData) {
        console.error('User not authenticated or KYC data not found');
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
      
      // Invalidate any cached KYC data to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['kyc', user?.id] });
      
      // Also invalidate admin KYC list if the user happens to be an admin
      queryClient.invalidateQueries({ queryKey: ['admin-kyc-verifications'] });
      
      // Force a refetch to get the latest data with the updated status
      refetch();
    },
    onError: (error) => {
      console.error('Error submitting verification:', error);
      toast.error('Failed to submit verification. Please try again.');
    }
  });
  
  return {
    kycData,
    isLoading,
    error,
    savePersonalInfo,
    uploadDocument,
    submitVerification,
    refetch
  };
}

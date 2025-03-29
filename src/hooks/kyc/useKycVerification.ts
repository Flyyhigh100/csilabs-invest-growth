
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
      return fetchKycVerification(user.id);
    },
    enabled: !!user,
  });
  
  // Save KYC personal information
  const savePersonalInfo = useMutation({
    mutationFn: async (formData: KycFormData) => {
      if (!user || !kycData) throw new Error('User not authenticated or KYC data not found');
      return saveKycPersonalInfo(user.id, formData);
    },
    onSuccess: () => {
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
      return uploadKycDocument(user.id, file, type);
    },
    onSuccess: () => {
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
      if (!user || !kycData) throw new Error('User not authenticated or KYC data not found');
      return submitKycVerification(user.id);
    },
    onSuccess: () => {
      // Invalidate any cached KYC data to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['kyc', user?.id] });
      
      // Also invalidate admin KYC list if the user happens to be an admin
      queryClient.invalidateQueries({ queryKey: ['admin-kyc-verifications'] });
      
      toast.success('Your verification has been submitted successfully! We will review it shortly.');
    },
    onError: (error) => {
      console.error('Error submitting verification:', error);
      toast.error('Failed to submit verification');
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

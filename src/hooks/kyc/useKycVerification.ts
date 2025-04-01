
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
  submitKycVerification,
  ensureKycRecordExists,
  testUpload
} from './kycService';
import { listAllBuckets } from '@/utils/admin/kyc/storage';

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
      
      try {
        // Check available buckets for debugging
        await listAllBuckets();
        
        // Ensure a KYC record exists for this user
        await ensureKycRecordExists(user.id);
        
        return fetchKycVerification(user.id);
      } catch (error) {
        console.error('Error in KYC data fetch:', error);
        toast.error('Failed to load KYC data. Please refresh the page.');
        throw error;
      }
    },
    enabled: !!user,
    staleTime: 0, // Always refetch when needed
    refetchOnWindowFocus: true,
  });
  
  // Save KYC personal information
  const savePersonalInfo = useMutation({
    mutationFn: async (formData: KycFormData) => {
      if (!user) throw new Error('User not authenticated');
      
      console.log('Saving personal info for user:', user.id);
      
      // Ensure we always create or update the KYC record
      try {
        // Check if KYC record exists first
        await ensureKycRecordExists(user.id);
        
        const result = await saveKycPersonalInfo(user.id, formData);
        console.log('KYC personal info saved:', result);
        return result;
      } catch (error) {
        console.error('Error in savePersonalInfo:', error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate all related queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['kyc', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['admin-kyc-verifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-all-users-kyc'] });
      
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
      
      try {
        // Ensure KYC record exists before uploading
        await ensureKycRecordExists(user.id);
        
        console.log(`Uploading ${type} document for user:`, user.id);
        return uploadKycDocument(user.id, file, type);
      } catch (error) {
        console.error(`Error in uploadDocument (${type}):`, error);
        
        // Try test upload to diagnose issues
        try {
          console.log('Attempting test upload to diagnose issues...');
          const testUrl = await testUpload(file);
          console.log('Test upload successful:', testUrl);
        } catch (testError) {
          console.error('Test upload also failed:', testError);
        }
        
        throw error;
      }
    },
    onSuccess: (url, variables) => {
      console.log(`Document uploaded successfully: ${variables.type}`, url);
      toast.success(`${variables.type.replace('_', ' ')} uploaded successfully`);
      
      // Invalidate all related queries
      queryClient.invalidateQueries({ queryKey: ['kyc', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['admin-kyc-verifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-all-users-kyc'] });
      
      refetch();
    },
    onError: (error, variables) => {
      console.error(`Error uploading document (${variables.type}):`, error);
      toast.error(`Failed to upload document: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
      
      // Force immediate invalidation of all related cached data
      queryClient.invalidateQueries({ queryKey: ['kyc', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['admin-kyc-verifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-all-users-kyc'] });
      
      // Force a refetch to get the latest data with the updated status
      setTimeout(() => {
        refetch();
      }, 500); // Small delay to ensure database has updated
    },
    onError: (error) => {
      console.error('Error submitting verification:', error);
      toast.error(`Failed to submit verification: ${error instanceof Error ? error.message : 'Please try again.'}`);
    }
  });
  
  // Debug function to help diagnose upload issues
  const runStorageCheck = async () => {
    try {
      console.log('Running storage diagnostics...');
      const buckets = await listAllBuckets();
      console.log('Available buckets:', buckets);
      return buckets;
    } catch (error) {
      console.error('Error in storage diagnostics:', error);
      return [];
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


import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { KycFormData } from './types';
import { 
  saveKycPersonalInfo, 
  uploadKycDocument, 
  submitKycVerification,
  ensureKycRecordExists
} from './kycService';

/**
 * Hook that provides mutation functions for KYC operations
 */
export function useKycMutations(userId: string | undefined, refetch: () => void) {
  const queryClient = useQueryClient();
  
  // Helper function to invalidate all related queries
  const invalidateRelatedQueries = () => {
    // Invalidate all related queries to ensure fresh data
    console.log('🔄 Invalidating KYC related queries for user:', userId);
    
    if (userId) {
      queryClient.invalidateQueries({ queryKey: ['kyc', userId] });
    }
    
    queryClient.invalidateQueries({ queryKey: ['admin-kyc-verifications'] });
    queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
    queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    queryClient.invalidateQueries({ queryKey: ['admin-all-users-kyc'] });
  };
  
  // Save KYC personal information
  const savePersonalInfo = useMutation({
    mutationFn: async (formData: KycFormData) => {
      if (!userId) throw new Error('User not authenticated');
      
      console.log('💾 Saving personal info for user:', userId);
      
      // Ensure we always create or update the KYC record
      try {
        // Check if KYC record exists first
        await ensureKycRecordExists(userId);
        
        const result = await saveKycPersonalInfo(userId, formData);
        console.log('✅ KYC personal info saved:', result);
        return result;
      } catch (error) {
        console.error('❌ Error in savePersonalInfo:', error);
        throw error;
      }
    },
    onSuccess: () => {
      invalidateRelatedQueries();
      refetch();
      toast.success('Personal information saved successfully');
    },
    onError: (error) => {
      console.error('❌ Error saving personal information:', error);
      toast.error(`Failed to save personal information: ${(error as Error).message}`);
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
      if (!userId) throw new Error('User not authenticated');
      
      // Ensure KYC record exists before uploading
      await ensureKycRecordExists(userId);
      
      console.log(`📤 Uploading ${type} document for user:`, userId);
      return uploadKycDocument(userId, file, type);
    },
    onSuccess: () => {
      invalidateRelatedQueries();
      refetch();
    },
    onError: (error) => {
      console.error('❌ Error uploading document:', error);
      toast.error(`Failed to upload document: ${(error as Error).message}`);
    }
  });
  
  // Submit KYC verification
  const submitVerification = useMutation({
    mutationFn: async () => {
      if (!userId) {
        console.error('❌ User not authenticated');
        throw new Error('User not authenticated');
      }
      
      console.log('📨 Submitting verification for user:', userId);
      
      // Proceed with submission
      try {
        // Submit verification
        const result = await submitKycVerification(userId);
        console.log('✅ Verification submission result:', result);
        return result;
      } catch (error) {
        console.error('❌ Error in submitVerification:', error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log("✅ KYC verification submitted successfully");
      
      // Force immediate invalidation of related cached data
      invalidateRelatedQueries();
      
      // Force immediate refetch with minimal delay
      setTimeout(() => {
        refetch();
        
        // Double refetch after a delay to ensure we get the latest data
        setTimeout(() => {
          refetch();
        }, 1000);
      }, 200);
    },
    onError: (error) => {
      console.error('❌ Error submitting verification:', error);
      toast.error(`Failed to submit verification: ${(error as Error).message}`);
    }
  });

  return {
    savePersonalInfo,
    uploadDocument,
    submitVerification
  };
}

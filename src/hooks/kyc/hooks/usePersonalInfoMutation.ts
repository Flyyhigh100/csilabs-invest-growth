
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { KycFormData } from '../types';
import { saveKycPersonalInfo, ensureKycRecordExists } from '../services/personalInfoService';
import { kycLogger } from '../utils/logger';

/**
 * Hook for saving KYC personal information
 */
export function usePersonalInfoMutation() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Save KYC personal information
  const savePersonalInfo = useMutation({
    mutationFn: async (formData: KycFormData) => {
      if (!user) throw new Error('User not authenticated');
      
      kycLogger.savingPersonalInfo(user.id);
      
      // Ensure we always create or update the KYC record
      try {
        // Check if KYC record exists first
        await ensureKycRecordExists(user.id);
        
        const result = await saveKycPersonalInfo(user.id, formData);
        kycLogger.dataSaved(result);
        return result;
      } catch (error) {
        kycLogger.personalInfoError(error);
        throw error;
      }
    },
    onSuccess: () => {
      // Invalidate all related queries to ensure fresh data
      queryClient.invalidateQueries({ queryKey: ['kyc', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['admin-kyc-verifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-all-users-kyc'] });
      
      toast.success('Personal information saved successfully');
    },
    onError: (error) => {
      kycLogger.log('error', 'Error saving personal information:', error);
      toast.error('Failed to save personal information');
    }
  });

  return { savePersonalInfo };
}

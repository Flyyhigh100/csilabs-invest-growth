
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { KycVerificationData } from '../types';
import { fetchKycVerification, ensureKycRecordExists } from '../services/personalInfoService';
import { listAllBuckets } from '@/utils/admin/kyc/storage';
import { kycLogger } from '../utils/logger';

/**
 * Hook to fetch KYC verification data
 */
export function useKycData() {
  const { user } = useAuth();
  
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
      kycLogger.fetchingData(user.id);
      
      try {
        // Check available buckets for debugging
        await listAllBuckets();
        
        // Ensure a KYC record exists for this user
        await ensureKycRecordExists(user.id);
        
        return fetchKycVerification(user.id);
      } catch (error) {
        kycLogger.dataFetchError(error);
        toast.error('Failed to load KYC data. Please refresh the page.');
        throw error;
      }
    },
    enabled: !!user,
    staleTime: 0, // Always refetch when needed
    refetchOnWindowFocus: true,
  });

  // Debug function to help diagnose upload issues
  const runStorageCheck = async () => {
    try {
      kycLogger.runningStorageDiagnostics();
      const buckets = await listAllBuckets();
      kycLogger.availableBuckets(buckets);
      return buckets;
    } catch (error) {
      kycLogger.storageDiagnosticsError(error);
      return [];
    }
  };

  return {
    kycData,
    isLoading,
    error,
    refetch,
    runStorageCheck
  };
}

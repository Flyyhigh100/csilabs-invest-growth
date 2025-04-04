
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { KycVerificationData } from './types';
import { fetchKycVerification, ensureKycRecordExists } from './kycService';
import { useKycRealtimeSubscription } from './useKycRealtimeSubscription';
import { useKycMutations } from './useKycMutations';

/**
 * Main hook for KYC verification functionality
 */
export function useKycVerification() {
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
      console.log('Fetching KYC data for user:', user.id);
      
      // Ensure a KYC record exists for this user
      await ensureKycRecordExists(user.id);
      
      return fetchKycVerification(user.id);
    },
    enabled: !!user,
    staleTime: 0, // Always refetch when needed
    refetchInterval: 5000, // Refetch every 5 seconds to ensure we get latest status
    refetchOnWindowFocus: true,
  });
  
  // Set up realtime subscription for KYC verification updates
  useKycRealtimeSubscription(user?.id, refetch);
  
  // Get mutation functions
  const mutations = useKycMutations(user?.id, refetch);
  
  return {
    kycData,
    isLoading,
    error,
    ...mutations,
    refetch
  };
}

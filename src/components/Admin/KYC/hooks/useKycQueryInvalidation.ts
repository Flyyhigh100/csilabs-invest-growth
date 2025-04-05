
import { useQueryClient } from '@tanstack/react-query';

/**
 * Hook for invalidating KYC-related queries
 */
export const useKycQueryInvalidation = () => {
  const queryClient = useQueryClient();
  
  const invalidateQueries = () => {
    // IMPORTANT: Invalidate all relevant queries to refresh data
    console.log('🔄 Invalidating queries to refresh data after successful KYC update');
    queryClient.invalidateQueries({ queryKey: ['admin-kyc-verifications'] });
    queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
    queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    queryClient.invalidateQueries({ queryKey: ['admin-all-users-kyc'] });
    
    // Force a more aggressive refetch with a small delay to ensure
    // the database has been updated
    setTimeout(() => {
      console.log('🔄 Performing delayed refetch of KYC data');
      queryClient.invalidateQueries({ queryKey: ['admin-kyc-verifications'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard-stats'] });
    }, 1000);
  };
  
  return { invalidateQueries };
};

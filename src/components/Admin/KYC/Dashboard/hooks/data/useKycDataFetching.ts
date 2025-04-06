import { useQuery } from '@tanstack/react-query';
import { 
  fetchKycVerifications, 
  listAllUsersWithKycStatus 
} from '../../../KycVerificationsService';
import { KycVerificationWithProfile } from '../../../types';

interface KycDataFetchingProps {
  isAdmin: boolean | null;
  manualRefreshCount: number;
}

/**
 * Hook for fetching KYC data and all users with KYC status
 */
export const useKycDataFetching = ({ isAdmin, manualRefreshCount }: KycDataFetchingProps) => {
  // Fetch KYC verifications
  const { 
    data: kycVerifications = [] as KycVerificationWithProfile[], 
    isLoading: isKycLoading, 
    error: kycError,
    refetch: refetchKyc
  } = useQuery({
    queryKey: ['admin-kyc-verifications', manualRefreshCount],
    queryFn: fetchKycVerifications,
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
    enabled: isAdmin === true,
  });
  
  // Fetch all users with KYC status
  const { 
    data: allUsersWithKyc = [] as any[], 
    isLoading: isUsersLoading,
    error: usersError,
    refetch: refetchUsers 
  } = useQuery({
    queryKey: ['admin-all-users-kyc', manualRefreshCount],
    queryFn: listAllUsersWithKycStatus,
    enabled: isAdmin === true,
  });
  
  // Combined refetch function
  const refetchAll = () => {
    console.log('Refetching all KYC data...');
    // Use Promise.all to perform both refetches in parallel
    return Promise.all([
      refetchKyc(),
      refetchUsers()
    ]).catch(error => {
      console.error('Error refetching KYC data:', error);
    });
  };
  
  return {
    kycVerifications,
    allUsersWithKyc,
    isLoading: isKycLoading || isUsersLoading,
    error: kycError || usersError,
    refetchKyc,
    refetchUsers,
    refetchAll
  };
};

/**
 * Helper function to merge regular KYC verifications with all users for complete list
 */
export const mergeKycData = (
  showAllUsers: boolean,
  allUsersWithKyc: any[],
  kycVerifications: KycVerificationWithProfile[]
): KycVerificationWithProfile[] => {
  if (!showAllUsers) return kycVerifications;
  
  return allUsersWithKyc.map(user => ({
    id: user.kyc_id || user.id,
    user_id: user.id,
    profile_first_name: user.first_name,
    profile_last_name: user.last_name,
    status: user.kyc_status || 'not_started',
    submitted_at: user.submitted_at,
    reviewed_at: user.reviewed_at,
    // Include all other KYC fields with default values
    first_name: null,
    last_name: null,
    date_of_birth: null,
    nationality: null,
    address: null,
    city: null,
    postal_code: null,
    country: null,
    id_front_url: null,
    id_back_url: null,
    selfie_url: null,
    rejection_reason: null,
    clarification_message: null,
    created_at: user.created_at,
    updated_at: user.updated_at,
    ...user.kyc_record
  }));
};

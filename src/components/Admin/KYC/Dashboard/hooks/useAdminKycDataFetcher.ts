
import { useState } from 'react';
import { useAdminVerification } from './admin/useAdminVerification';
import { useKycRealtimeUpdates } from './realtime/useKycRealtimeUpdates';
import { useKycDataFetching } from './data/useKycDataFetching';
import { useKycDataState } from './state/useKycDataState';
import { KycVerificationWithProfile } from '../../KYC/types';

export const useAdminKycDataFetcher = () => {
  // Check admin access
  const { isAdmin } = useAdminVerification();
  
  // State for handling manual refresh
  const [manualRefreshCount, setManualRefreshCount] = useState(0);
  
  // Fetch KYC data with proper default values to avoid type errors
  const { 
    kycVerifications = [] as KycVerificationWithProfile[], 
    allUsersWithKyc = [] as any[],
    isLoading,
    error,
    refetchAll
  } = useKycDataFetching({ 
    isAdmin, 
    manualRefreshCount 
  });
  
  // Set up realtime subscription
  const { realtimeEnabled } = useKycRealtimeUpdates(isAdmin, refetchAll);
  
  // Manage data state
  const {
    showAllUsers,
    setShowAllUsers,
    mergedKycVerifications,
    handleManualRefresh
  } = useKycDataState({
    kycVerifications: kycVerifications as KycVerificationWithProfile[],
    allUsersWithKyc: allUsersWithKyc as any[],
    refetchAll
  });
  
  return {
    kycVerifications: mergedKycVerifications,
    isLoading,
    error,
    showAllUsers,
    setShowAllUsers,
    allUsersWithKyc,
    handleManualRefresh,
    refetch: refetchAll,
    realtimeEnabled,
    manualRefreshCount,
    isAdmin
  };
};

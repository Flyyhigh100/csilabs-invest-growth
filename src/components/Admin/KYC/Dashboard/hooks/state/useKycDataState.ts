
import { useState } from 'react';
import { toast } from 'sonner';
import { KycVerificationWithProfile } from '../../../types';
import { mergeKycData } from '../data/useKycDataFetching';

interface KycDataStateProps {
  kycVerifications: KycVerificationWithProfile[];
  allUsersWithKyc: any[];
  refetchAll: () => void;
}

/**
 * Hook for managing KYC data state
 */
export const useKycDataState = ({ 
  kycVerifications, 
  allUsersWithKyc,
  refetchAll
}: KycDataStateProps) => {
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [manualRefreshCount, setManualRefreshCount] = useState(0);
  
  // Merge KYC data based on showAllUsers state
  const mergedKycVerifications = mergeKycData(showAllUsers, allUsersWithKyc, kycVerifications);
  
  // Handle manual refresh
  const handleManualRefresh = async () => {
    console.log('Manual refresh triggered');
    setManualRefreshCount(prev => prev + 1);
    refetchAll();
    toast.success('Refreshing KYC data...');
  };
  
  return {
    showAllUsers,
    setShowAllUsers,
    mergedKycVerifications,
    handleManualRefresh,
    manualRefreshCount,
    setManualRefreshCount
  };
};

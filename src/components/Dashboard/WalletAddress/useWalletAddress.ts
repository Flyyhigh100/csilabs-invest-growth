
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useProfileData } from '@/hooks/useProfileData';
import type { NetworkType } from './networkValidation';

export const useWalletAddress = () => {
  const { user } = useAuth();
  const { profileData, isLoading, refetch } = useProfileData();
  const [isLoadingWallet, setIsLoadingWallet] = useState(true);
  
  // Extract wallet addresses from profile data
  const walletAddress = profileData?.wallet_address || null;
  const solanaWalletAddress = profileData?.solana_wallet_address || null;
  const preferredNetwork = (profileData?.preferred_network as NetworkType) || 'polygon';
  
  // Check if user has any wallet address
  const hasAnyWallet = !!(walletAddress || solanaWalletAddress);
  
  useEffect(() => {
    if (!isLoading) {
      setIsLoadingWallet(false);
    }
  }, [isLoading]);
  
  const handleWalletUpdated = async () => {
    try {
      await refetch();
    } catch (error) {
      console.error("Error refreshing wallet data:", error);
    }
  };
  
  return {
    user,
    walletAddress,
    solanaWalletAddress,
    preferredNetwork,
    hasAnyWallet,
    isLoadingWallet,
    handleWalletUpdated,
    refetch
  };
};

export default useWalletAddress;

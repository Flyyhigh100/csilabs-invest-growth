
import { usePriceHistory } from './token/usePriceHistory';
import { useVolumeHistory } from './token/useVolumeHistory';
import { useCurrentPrice } from './token/useCurrentPrice';
import { useTokenInfo } from './token/useTokenInfo';
import { useTokenError } from './token/useTokenError';

export const useTokenData = () => {
  const { 
    data: priceData = [], 
    isLoading: isPriceLoading,
    error: priceError,
    refetch: refetchPrice
  } = usePriceHistory();

  const { 
    data: volumeData = [], 
    isLoading: isVolumeLoading,
    error: volumeError,
    refetch: refetchVolume
  } = useVolumeHistory();

  const {
    data: currentPrice,
    isLoading: isCurrentPriceLoading,
    error: currentPriceError,
    refetch: refetchCurrentPrice
  } = useCurrentPrice();

  const {
    data: tokenInfo,
    isLoading: isTokenInfoLoading,
    error: tokenInfoError,
    refetch: refetchTokenInfo
  } = useTokenInfo();

  // Use error handling hook
  const { hasError, errorMessage } = useTokenError([
    priceError, 
    volumeError, 
    currentPriceError, 
    tokenInfoError
  ]);

  // Determine if any data is loading
  const isLoading = isPriceLoading || isVolumeLoading || isCurrentPriceLoading || isTokenInfoLoading;

  // Function to manually refresh all data
  const refreshAllData = () => {
    console.log('Manually refreshing all token data');
    refetchPrice();
    refetchVolume();
    refetchCurrentPrice();
    refetchTokenInfo();
    
    toast({
      title: "Refreshing Data",
      description: "Fetching the latest token data...",
    });
  };

  return {
    priceData,
    volumeData,
    currentPrice,
    tokenInfo,
    isLoading,
    hasError,
    errorMessage,
    refreshAllData
  };
};

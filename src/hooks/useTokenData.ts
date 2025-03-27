
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  fetchTokenPriceHistory, 
  fetchTokenVolumeHistory,
  fetchCurrentTokenPrice,
  fetchTokenInfo
} from '@/services/tokenDataService';
import { TokenPriceData, TokenVolumeData, TokenInfo } from '@/types/token';
import { toast } from "@/components/ui/use-toast";

export const useTokenData = () => {
  // Query for price history data
  const { 
    data: priceData, 
    isLoading: isPriceLoading, 
    error: priceError,
    refetch: refetchPrice
  } = useQuery({
    queryKey: ['tokenPriceHistory'],
    queryFn: async () => {
      try {
        return await fetchTokenPriceHistory();
      } catch (error) {
        console.error('Price history query failed:', error);
        toast({
          title: "Error",
          description: "Could not load price history. Please try again later.",
          variant: "destructive",
        });
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  });

  // Query for volume history data
  const { 
    data: volumeData, 
    isLoading: isVolumeLoading, 
    error: volumeError,
    refetch: refetchVolume
  } = useQuery({
    queryKey: ['tokenVolumeHistory'],
    queryFn: async () => {
      try {
        return await fetchTokenVolumeHistory();
      } catch (error) {
        console.error('Volume history query failed:', error);
        toast({
          title: "Error",
          description: "Could not load volume history. Please try again later.",
          variant: "destructive",
        });
        return [];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  });

  // Query for current price
  const { 
    data: currentPrice, 
    isLoading: isCurrentPriceLoading, 
    error: currentPriceError,
    refetch: refetchCurrentPrice
  } = useQuery({
    queryKey: ['currentTokenPrice'],
    queryFn: async () => {
      try {
        return await fetchCurrentTokenPrice();
      } catch (error) {
        console.error('Current price query failed:', error);
        toast({
          title: "Error",
          description: "Could not load current price. Please try again later.",
          variant: "destructive",
        });
        return null;
      }
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 1 * 60 * 1000, // Refresh every minute
    refetchOnWindowFocus: true,
    retry: 2,
  });

  // Query for token info
  const {
    data: tokenInfo,
    isLoading: isTokenInfoLoading,
    error: tokenInfoError,
    refetch: refetchTokenInfo
  } = useQuery({
    queryKey: ['tokenInfo'],
    queryFn: async () => {
      try {
        return await fetchTokenInfo();
      } catch (error) {
        console.error('Token info query failed:', error);
        toast({
          title: "Error",
          description: "Could not load token information. Please try again later.",
          variant: "destructive",
        });
        return null;
      }
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  });

  // Function to manually refresh all data
  const refreshAllData = () => {
    refetchPrice();
    refetchVolume();
    refetchCurrentPrice();
    refetchTokenInfo();
  };

  // Log errors for debugging
  useEffect(() => {
    if (priceError) console.error('Price data error:', priceError);
    if (volumeError) console.error('Volume data error:', volumeError);
    if (currentPriceError) console.error('Current price error:', currentPriceError);
    if (tokenInfoError) console.error('Token info error:', tokenInfoError);
  }, [priceError, volumeError, currentPriceError, tokenInfoError]);

  // Determine if any data is loading
  const isLoading = isPriceLoading || isVolumeLoading || isCurrentPriceLoading || isTokenInfoLoading;

  // Determine if there are any errors - ensure this returns a boolean
  const hasError = !!(priceError || volumeError || currentPriceError || tokenInfoError);
  
  // Create a formatted error message if there's an error
  const errorMessage = hasError ? 'Error loading token data' : null;

  return {
    priceData: priceData || [],
    volumeData: volumeData || [],
    currentPrice,
    tokenInfo,
    isLoading,
    hasError,
    errorMessage,
    refreshAllData
  };
};

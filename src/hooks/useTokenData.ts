
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
        console.log('Starting price history query');
        const result = await fetchTokenPriceHistory();
        console.log('Price history query result count:', result.length);
        
        if (result.length === 0) {
          toast({
            title: "Warning",
            description: "No price history data available for the specified time range.",
            variant: "destructive",
          });
        }
        
        return result;
      } catch (error) {
        console.error('Price history query failed:', error);
        toast({
          title: "Error",
          description: "Could not load price history. Using demo data instead.",
          variant: "destructive",
        });
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 3, // Increase retry count for better chances of success
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
        console.log('Starting volume history query');
        const result = await fetchTokenVolumeHistory();
        console.log('Volume history query result count:', result.length);
        
        if (result.length === 0) {
          toast({
            title: "Warning",
            description: "No volume history data available for the specified time range.",
            variant: "destructive",
          });
        }
        
        return result;
      } catch (error) {
        console.error('Volume history query failed:', error);
        toast({
          title: "Error",
          description: "Could not load volume history. Using demo data instead.",
          variant: "destructive",
        });
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 3, // Increase retry count
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
        console.log('Fetching current token price');
        return await fetchCurrentTokenPrice();
      } catch (error) {
        console.error('Current price query failed:', error);
        toast({
          title: "Error",
          description: "Could not load current price. Using demo data instead.",
          variant: "destructive",
        });
        throw error;
      }
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 1 * 60 * 1000, // Refresh every minute
    refetchOnWindowFocus: true,
    retry: 3,
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
        console.log('Fetching token info');
        return await fetchTokenInfo();
      } catch (error) {
        console.error('Token info query failed:', error);
        toast({
          title: "Error",
          description: "Could not load token information. Please try again later.",
          variant: "destructive",
        });
        throw error;
      }
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    retry: 3,
  });

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

  // Log errors for debugging
  useEffect(() => {
    if (priceError) console.error('Price data error:', priceError);
    if (volumeError) console.error('Volume data error:', volumeError);
    if (currentPriceError) console.error('Current price error:', currentPriceError);
    if (tokenInfoError) console.error('Token info error:', tokenInfoError);
  }, [priceError, volumeError, currentPriceError, tokenInfoError]);

  // Log data for debugging
  useEffect(() => {
    if (priceData) {
      console.log('Price data loaded:', priceData.length, 'data points');
      if (priceData.length > 0) {
        console.log('First price data point:', priceData[0]);
        console.log('Last price data point:', priceData[priceData.length - 1]);
      }
    }
    if (volumeData) {
      console.log('Volume data loaded:', volumeData.length, 'data points');
      if (volumeData.length > 0) {
        console.log('First volume data point:', volumeData[0]);
        console.log('Last volume data point:', volumeData[volumeData.length - 1]);
      }
    }
    if (currentPrice) console.log('Current price loaded:', currentPrice);
  }, [priceData, volumeData, currentPrice]);

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


import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  fetchTokenPriceHistory, 
  fetchTokenVolumeHistory,
  fetchCurrentTokenPrice
} from '@/services/tokenDataService';
import { TokenPriceData, TokenVolumeData } from '@/types/token';

export const useTokenData = () => {
  // Query for price history data
  const { 
    data: priceData, 
    isLoading: isPriceLoading, 
    error: priceError 
  } = useQuery({
    queryKey: ['tokenPriceHistory'],
    queryFn: fetchTokenPriceHistory,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Query for volume history data
  const { 
    data: volumeData, 
    isLoading: isVolumeLoading, 
    error: volumeError 
  } = useQuery({
    queryKey: ['tokenVolumeHistory'],
    queryFn: fetchTokenVolumeHistory,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Query for current price
  const { 
    data: currentPrice, 
    isLoading: isCurrentPriceLoading, 
    error: currentPriceError 
  } = useQuery({
    queryKey: ['currentTokenPrice'],
    queryFn: fetchCurrentTokenPrice,
    staleTime: 1 * 60 * 1000, // 1 minute
    refetchInterval: 1 * 60 * 1000, // Refresh every minute
  });

  // Determine if any data is loading
  const isLoading = isPriceLoading || isVolumeLoading || isCurrentPriceLoading;

  // Determine if there are any errors
  const hasError = priceError || volumeError || currentPriceError;
  
  // Create a formatted error message if there's an error
  const errorMessage = hasError ? 'Error loading token data' : null;

  return {
    priceData: priceData || [],
    volumeData: volumeData || [],
    currentPrice,
    isLoading,
    hasError,
    errorMessage
  };
};

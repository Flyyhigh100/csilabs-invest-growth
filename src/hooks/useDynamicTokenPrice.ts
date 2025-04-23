
import { useState, useCallback, useEffect } from 'react';
import { useTokenPrice } from '@/context/TokenPriceContext';
import { toast } from 'sonner';

export const useDynamicTokenPrice = (initialUsdAmount: number = 100) => {
  const { 
    currentPrice, 
    isLoading, 
    error, 
    refreshPrice, 
    convertUsdToTokens,
    lastUpdated,
    timeUntilNextUpdate
  } = useTokenPrice();
  
  const [usdAmount, setUsdAmount] = useState<number>(initialUsdAmount);
  const [tokenAmount, setTokenAmount] = useState<number>(0);
  
  // Update token amount when USD amount or price changes
  useEffect(() => {
    if (currentPrice && currentPrice > 0) {
      setTokenAmount(convertUsdToTokens(usdAmount));
    } else {
      // Fallback to 1:1 ratio if no valid price
      setTokenAmount(usdAmount);
    }
  }, [usdAmount, currentPrice, convertUsdToTokens]);
  
  // Force refresh price and show toast with result
  const handleRefreshPrice = useCallback(async () => {
    try {
      await refreshPrice();
    } catch (err) {
      toast.error("Failed to update price", {
        description: "Using last known price. Please try again later."
      });
    }
  }, [refreshPrice]);
  
  return {
    usdAmount,
    setUsdAmount,
    tokenAmount,
    currentPrice,
    isLoading,
    error,
    refreshPrice: handleRefreshPrice,
    lastUpdated,
    timeUntilNextUpdate
  };
};

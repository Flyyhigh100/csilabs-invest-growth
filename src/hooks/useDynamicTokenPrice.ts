import { useState, useEffect } from 'react';
import { STATIC_TOKEN_PRICE } from '@/services/api/staticPrice';

export const useDynamicTokenPrice = (initialUsdAmount: number = 100) => {
  const [usdAmount, setUsdAmount] = useState<number>(initialUsdAmount);
  const [tokenAmount, setTokenAmount] = useState<number>(initialUsdAmount / STATIC_TOKEN_PRICE);

  useEffect(() => {
    setTokenAmount(usdAmount / STATIC_TOKEN_PRICE);
  }, [usdAmount]);

  return {
    usdAmount,
    setUsdAmount,
    tokenAmount,
    currentPrice: STATIC_TOKEN_PRICE,
    isLoading: false,
    error: null as Error | null,
    refreshPrice: async () => {},
    lastUpdated: new Date(),
    timeUntilNextUpdate: 0,
  };
};

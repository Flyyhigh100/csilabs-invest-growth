
import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { fetchCurrentTokenPrice } from '@/services/api/priceService';
import { toast } from 'sonner';

interface TokenPriceContextType {
  currentPrice: number | null;
  isLoading: boolean;
  error: Error | null;
  lastUpdated: Date | null;
  timeUntilNextUpdate: number;
  refreshPrice: () => Promise<void>;
  convertUsdToTokens: (usdAmount: number) => number;
  convertTokensToUsd: (tokenAmount: number) => number;
}

const TokenPriceContext = createContext<TokenPriceContextType | undefined>(undefined);

export const useTokenPrice = () => {
  const context = useContext(TokenPriceContext);
  if (!context) {
    throw new Error('useTokenPrice must be used within a TokenPriceProvider');
  }
  return context;
};

interface TokenPriceProviderProps {
  children: ReactNode;
  refreshInterval?: number;
}

export const TokenPriceProvider = ({ 
  children,
  refreshInterval = 60000 // Updated to 60 seconds (1 minute)
}: TokenPriceProviderProps) => {
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [timeUntilNextUpdate, setTimeUntilNextUpdate] = useState<number>(refreshInterval);
  const [retryCount, setRetryCount] = useState<number>(0);
  const [retryTimeout, setRetryTimeout] = useState<NodeJS.Timeout | null>(null);

  // Function to calculate backoff delay for retries
  const getBackoffDelay = (retry: number): number => {
    // Exponential backoff: 5s, 10s, 20s, 40s, max 60s
    return Math.min(5000 * Math.pow(2, retry), 60000);
  };

  const fetchPrice = async (showToast: boolean = false) => {
    // Clear any existing retry timeout
    if (retryTimeout) {
      clearTimeout(retryTimeout);
      setRetryTimeout(null);
    }
    
    try {
      setIsLoading(true);
      const price = await fetchCurrentTokenPrice(showToast);
      setCurrentPrice(price);
      setLastUpdated(new Date());
      
      if (showToast) {
        toast.success("Price updated", {
          description: `Current token price: $${price.toFixed(5)}`
        });
      }
      
      setError(null);
      setRetryCount(0); // Reset retry count on success
    } catch (err) {
      console.error('Error fetching token price:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch token price'));
      
      if (showToast) {
        toast.error("Price update failed", {
          description: "Using last known price. Will retry automatically."
        });
      }
      
      // Implement exponential backoff for retries
      const nextRetry = retryCount + 1;
      setRetryCount(nextRetry);
      
      const delay = getBackoffDelay(nextRetry);
      console.log(`Scheduling retry #${nextRetry} in ${delay}ms`);
      
      const timeout = setTimeout(() => {
        console.log(`Executing retry #${nextRetry}`);
        fetchPrice(false); // Don't show toast on auto-retry
      }, delay);
      
      setRetryTimeout(timeout);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchPrice();
    return () => {
      if (retryTimeout) {
        clearTimeout(retryTimeout);
      }
    };
  }, []);
  
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchPrice();
    }, refreshInterval);
    
    const countdownId = setInterval(() => {
      setTimeUntilNextUpdate(prev => prev > 0 ? prev - 1000 : refreshInterval);
    }, 1000);
    
    return () => {
      clearInterval(intervalId);
      clearInterval(countdownId);
    };
  }, [refreshInterval]);
  
  const convertUsdToTokens = (usdAmount: number): number => {
    if (!currentPrice || currentPrice <= 0) return 0;
    return usdAmount / currentPrice;
  };
  
  const convertTokensToUsd = (tokenAmount: number): number => {
    if (!currentPrice) return 0;
    return tokenAmount * currentPrice;
  };
  
  return (
    <TokenPriceContext.Provider 
      value={{
        currentPrice,
        isLoading,
        error,
        lastUpdated,
        timeUntilNextUpdate,
        refreshPrice: () => fetchPrice(true),
        convertUsdToTokens,
        convertTokensToUsd
      }}
    >
      {children}
    </TokenPriceContext.Provider>
  );
};


import { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { fetchCurrentTokenPrice, getTimeUntilNextPriceRefresh, getPriceLastUpdatedTime } from '@/services/api/priceService';
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
  refreshInterval = 30000 // Default: refresh every 30 seconds
}: TokenPriceProviderProps) => {
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [timeUntilNextUpdate, setTimeUntilNextUpdate] = useState<number>(refreshInterval);

  // Function to fetch and update the current token price
  const fetchPrice = async (showToast: boolean = false) => {
    try {
      setIsLoading(true);
      const price = await fetchCurrentTokenPrice(true); // Force fresh data
      setCurrentPrice(price);
      
      const lastUpdatedTime = getPriceLastUpdatedTime();
      if (lastUpdatedTime) {
        setLastUpdated(new Date(lastUpdatedTime));
      }
      
      if (showToast) {
        toast.success("Price updated", {
          description: `Current token price: $${price.toFixed(5)}`
        });
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching token price:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch token price'));
      
      if (showToast) {
        toast.error("Price update failed", {
          description: "Using last known price. Please try again later."
        });
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  // Initialize price on mount
  useEffect(() => {
    fetchPrice();
  }, []);
  
  // Setup automatic refresh interval
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchPrice();
    }, refreshInterval);
    
    // Update countdown timer every second
    const countdownId = setInterval(() => {
      const remaining = getTimeUntilNextPriceRefresh();
      setTimeUntilNextUpdate(remaining > 0 ? remaining : 0);
    }, 1000);
    
    return () => {
      clearInterval(intervalId);
      clearInterval(countdownId);
    };
  }, [refreshInterval]);
  
  // Conversion helpers
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

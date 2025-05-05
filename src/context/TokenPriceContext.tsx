
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
  dataSource: 'on-chain' | 'on-chain-v4' | 'on-chain-v3' | 'defined.fi' | 'dexscreener' | 'cache' | null;
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
  refreshInterval = 60000 
}: TokenPriceProviderProps) => {
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [timeUntilNextUpdate, setTimeUntilNextUpdate] = useState<number>(refreshInterval);
  const [dataSource, setDataSource] = useState<'on-chain' | 'on-chain-v4' | 'on-chain-v3' | 'defined.fi' | 'dexscreener' | 'cache' | null>(null);

  const fetchPrice = async (showToast: boolean = false) => {
    try {
      setIsLoading(true);
      
      try {
        // In the real implementation, the price service should return both the price and source
        const result = await fetchCurrentTokenPrice(showToast);
        
        // Check if the result is a simple number (backwards compatibility) or an object with source info
        let price: number;
        let source: 'on-chain' | 'on-chain-v4' | 'on-chain-v3' | 'defined.fi' | 'dexscreener' | 'cache';
        
        if (typeof result === 'number') {
          // Legacy format, try to infer source from console logs or default to unknown
          price = result;
          source = 'on-chain'; // Default assumption
        } else {
          // New format with explicit source information
          price = result.price;
          source = result.source;
        }
        
        console.log('TokenPriceContext received price:', price, 'from source:', source);
        
        setCurrentPrice(price);
        setLastUpdated(new Date());
        setDataSource(source);
        
        if (showToast) {
          toast.success("Price updated", {
            description: `Current token price: $${price.toFixed(5)} (${source})`
          });
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching token price:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch token price'));
        setDataSource(null);
        
        if (showToast) {
          toast.warning("Using fallback price data", {
            description: "Real-time price unavailable. Using latest known price."
          });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchPrice();
    
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
        convertTokensToUsd,
        dataSource
      }}
    >
      {children}
    </TokenPriceContext.Provider>
  );
};

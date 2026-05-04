import { createContext, useContext, ReactNode } from 'react';
import { STATIC_TOKEN_PRICE } from '@/services/api/staticPrice';

type DataSource = 'on-chain' | 'on-chain-v4' | 'on-chain-v3' | 'defined.fi' | 'dexscreener' | 'cache' | 'static' | null;

interface TokenPriceContextType {
  currentPrice: number | null;
  isLoading: boolean;
  error: Error | null;
  lastUpdated: Date | null;
  timeUntilNextUpdate: number;
  refreshPrice: () => Promise<void>;
  convertUsdToTokens: (usdAmount: number) => number;
  convertTokensToUsd: (tokenAmount: number) => number;
  dataSource: DataSource;
}

const TokenPriceContext = createContext<TokenPriceContextType | undefined>(undefined);

export const useTokenPrice = () => {
  const context = useContext(TokenPriceContext);
  if (!context) throw new Error('useTokenPrice must be used within a TokenPriceProvider');
  return context;
};

interface TokenPriceProviderProps {
  children: ReactNode;
  refreshInterval?: number;
}

/**
 * Token price is locked at a static $1.00 USD per coin (May 2026 client decision).
 * The provider keeps its API surface so existing consumers continue to work.
 */
export const TokenPriceProvider = ({ children }: TokenPriceProviderProps) => {
  const value: TokenPriceContextType = {
    currentPrice: STATIC_TOKEN_PRICE,
    isLoading: false,
    error: null,
    lastUpdated: new Date(),
    timeUntilNextUpdate: 0,
    refreshPrice: async () => {},
    convertUsdToTokens: (usdAmount: number) => usdAmount / STATIC_TOKEN_PRICE,
    convertTokensToUsd: (tokenAmount: number) => tokenAmount * STATIC_TOKEN_PRICE,
    dataSource: 'static',
  };

  return <TokenPriceContext.Provider value={value}>{children}</TokenPriceContext.Provider>;
};

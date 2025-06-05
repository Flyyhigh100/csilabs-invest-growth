
import { useQuery } from '@tanstack/react-query';

export interface CryptoPriceData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  isValid: boolean;
  lastUpdated: Date;
}

export interface CryptoPricesResponse {
  [key: string]: CryptoPriceData;
}

// Price validation ranges based on current market conditions
const PRICE_VALIDATION_RANGES: Record<string, { min: number; max: number; name: string }> = {
  'BTC': { min: 80000, max: 200000, name: 'Bitcoin' },
  'ETH': { min: 2000, max: 10000, name: 'Ethereum' },
  'BNB': { min: 400, max: 1500, name: 'BNB' },
  'SOL': { min: 150, max: 500, name: 'Solana' },
  'POL': { min: 0.3, max: 2.0, name: 'Polygon' },
  'MATIC': { min: 0.3, max: 2.0, name: 'Polygon (Legacy)' },
  'USDT': { min: 0.98, max: 1.02, name: 'Tether' },
  'USDC': { min: 0.98, max: 1.02, name: 'USD Coin' },
  'BUSD': { min: 0.98, max: 1.02, name: 'Binance USD' },
  'DAI': { min: 0.98, max: 1.02, name: 'Dai' }
};

const validatePrice = (symbol: string, price: number): boolean => {
  const range = PRICE_VALIDATION_RANGES[symbol];
  if (!range) return true;
  return price >= range.min && price <= range.max;
};

const getCurrentFallbackPrices = (): CryptoPricesResponse => {
  const fallbackPrices: Record<string, number> = {
    'BTC': 100000,
    'ETH': 3500,
    'BNB': 650,
    'SOL': 240,
    'POL': 0.48,
    'MATIC': 0.48,
    'USDT': 1.0,
    'USDC': 1.0,
    'BUSD': 1.0,
    'DAI': 1.0
  };

  const result: CryptoPricesResponse = {};
  
  Object.entries(fallbackPrices).forEach(([symbol, price]) => {
    const range = PRICE_VALIDATION_RANGES[symbol];
    result[symbol] = {
      symbol,
      name: range?.name || symbol,
      price,
      change24h: 0,
      isValid: false, // Mark as fallback
      lastUpdated: new Date()
    };
  });

  return result;
};

const fetchEnhancedCryptoPrices = async (): Promise<CryptoPricesResponse> => {
  try {
    // Try CoinCap API first
    const response = await fetch('https://api.coincap.io/v2/assets?limit=10');
    
    if (!response.ok) {
      throw new Error(`CoinCap API error: ${response.status}`);
    }
    
    const data = await response.json();
    const prices: CryptoPricesResponse = {};
    
    // Map CoinCap symbols to our symbols
    const symbolMap: Record<string, string> = {
      'bitcoin': 'BTC',
      'ethereum': 'ETH',
      'binance-coin': 'BNB',
      'solana': 'SOL',
      'polygon': 'POL',
      'tether': 'USDT',
      'usd-coin': 'USDC',
      'binance-usd': 'BUSD',
      'multi-collateral-dai': 'DAI'
    };
    
    // Process each asset from CoinCap
    data.data?.forEach((asset: any) => {
      const symbol = symbolMap[asset.id];
      if (symbol) {
        const price = parseFloat(asset.priceUsd) || 0;
        const change24h = parseFloat(asset.changePercent24Hr) || 0;
        const isValid = validatePrice(symbol, price);
        
        if (isValid) {
          prices[symbol] = {
            symbol,
            name: asset.name,
            price,
            change24h,
            isValid: true,
            lastUpdated: new Date()
          };
        } else {
          console.warn(`Invalid price for ${symbol}: $${price}, using fallback`);
        }
      }
    });
    
    // Add MATIC as alias for POL
    if (prices['POL']) {
      prices['MATIC'] = {
        ...prices['POL'],
        symbol: 'MATIC',
        name: 'Polygon (Legacy)'
      };
    }
    
    // Fill in missing currencies with fallback data
    const fallbackData = getCurrentFallbackPrices();
    Object.keys(PRICE_VALIDATION_RANGES).forEach(symbol => {
      if (!prices[symbol]) {
        prices[symbol] = fallbackData[symbol];
      }
    });
    
    console.log('Enhanced crypto prices fetched successfully:', prices);
    return prices;
    
  } catch (error) {
    console.error('Error fetching enhanced crypto prices:', error);
    return getCurrentFallbackPrices();
  }
};

export const useEnhancedCryptoPrices = () => {
  return useQuery({
    queryKey: ['enhanced-crypto-prices'],
    queryFn: fetchEnhancedCryptoPrices,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Auto-refresh every 30 seconds
    refetchOnWindowFocus: true,
    retry: 2,
  });
};

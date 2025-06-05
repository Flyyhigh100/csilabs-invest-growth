
import { useQuery } from '@tanstack/react-query';

export interface CryptoPriceData {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  isValid: boolean;
  lastUpdated: Date;
  source: 'coingecko' | 'fallback';
}

export interface CryptoPricesResponse {
  [key: string]: CryptoPriceData;
}

// Price validation ranges based on current market conditions
const PRICE_VALIDATION_RANGES: Record<string, { min: number; max: number; name: string }> = {
  'BTC': { min: 90000, max: 200000, name: 'Bitcoin' },
  'ETH': { min: 2500, max: 10000, name: 'Ethereum' },
  'BNB': { min: 500, max: 1500, name: 'BNB' },
  'SOL': { min: 180, max: 500, name: 'Solana' },
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
    'BTC': 104000,
    'ETH': 3800,
    'BNB': 720,
    'SOL': 250,
    'POL': 0.52,
    'MATIC': 0.52,
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
      isValid: false,
      source: 'fallback',
      lastUpdated: new Date()
    };
  });

  return result;
};

const fetchEnhancedCryptoPrices = async (): Promise<CryptoPricesResponse> => {
  try {
    // CoinGecko coin IDs mapping
    const coinGeckoIds = [
      'bitcoin',
      'ethereum', 
      'binancecoin',
      'solana',
      'matic-network',
      'tether',
      'usd-coin',
      'binance-usd',
      'dai'
    ].join(',');

    console.log('Fetching prices from CoinGecko...');
    
    // Use CoinGecko's free API
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coinGeckoIds}&vs_currencies=usd&include_24hr_change=true`,
      {
        headers: {
          'Accept': 'application/json',
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }
    
    const data = await response.json();
    const prices: CryptoPricesResponse = {};
    
    // Map CoinGecko data to our format
    const symbolMap: Record<string, string> = {
      'bitcoin': 'BTC',
      'ethereum': 'ETH',
      'binancecoin': 'BNB',
      'solana': 'SOL',
      'matic-network': 'POL',
      'tether': 'USDT',
      'usd-coin': 'USDC',
      'binance-usd': 'BUSD',
      'dai': 'DAI'
    };
    
    // Process each cryptocurrency
    Object.entries(data).forEach(([coinId, coinData]: [string, any]) => {
      const symbol = symbolMap[coinId];
      if (symbol && coinData.usd) {
        const price = coinData.usd;
        const change24h = coinData.usd_24h_change || 0;
        const isValid = validatePrice(symbol, price);
        
        if (isValid) {
          const range = PRICE_VALIDATION_RANGES[symbol];
          prices[symbol] = {
            symbol,
            name: range?.name || symbol,
            price,
            change24h,
            isValid: true,
            source: 'coingecko',
            lastUpdated: new Date()
          };
          console.log(`✅ CoinGecko price for ${symbol}: $${price.toFixed(2)} (${change24h >= 0 ? '+' : ''}${change24h.toFixed(2)}%)`);
        } else {
          console.warn(`❌ Invalid price for ${symbol}: $${price}, using fallback`);
        }
      }
    });
    
    // Add MATIC as alias for POL for backward compatibility
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
        console.warn(`⚠️ Using fallback price for ${symbol}: $${fallbackData[symbol].price}`);
      }
    });
    
    const validCount = Object.values(prices).filter(p => p.isValid).length;
    const totalCount = Object.keys(prices).length;
    
    console.log(`✅ CoinGecko pricing: ${validCount}/${totalCount} live prices fetched successfully`);
    return prices;
    
  } catch (error) {
    console.error('❌ Error fetching from CoinGecko:', error);
    console.log('🔄 Falling back to static prices');
    return getCurrentFallbackPrices();
  }
};

export const useEnhancedCryptoPrices = () => {
  return useQuery({
    queryKey: ['enhanced-crypto-prices-coingecko'],
    queryFn: fetchEnhancedCryptoPrices,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Auto-refresh every 30 seconds
    refetchOnWindowFocus: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

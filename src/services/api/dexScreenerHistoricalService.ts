
import { TokenPriceData } from '@/types/token';
import { isValidPrice } from './utils/priceValidation';

interface DexScreenerPairData {
  pair: {
    priceUsd: string;
    txns: {
      h24: {
        buys: number;
        sells: number;
      };
    };
    volume: number;
    priceChange: {
      h24: number;
    };
    liquidity: {
      usd: number;
    };
    fdv: number;
    pairCreatedAt: number;
  };
  pairs: Array<{
    priceUsd: string;
    timestamp: number;
  }>;
}

const PAIR = import.meta.env.VITE_PAIR_ADDRESS?.toLowerCase() ||
  '0x03f8fe849404dca3ae3e16ac4ff0b240dbc139f4';

export const fetchDexScreenerHistorical = async (): Promise<TokenPriceData[]> => {
  try {
    console.log('Fetching historical price data from DexScreener for pair:', PAIR);
    
    const res = await fetch(`https://api.dexscreener.com/latest/dex/pairs/polygon/${PAIR}/chart/history`);
    if (!res.ok) {
      console.error('DexScreener Historical API error:', res.status);
      throw new Error('DexScreener Historical ' + res.status);
    }
    
    const json: DexScreenerPairData = await res.json();
    console.log('Raw DexScreener response:', json);
    
    if (!json.pairs || !Array.isArray(json.pairs)) {
      console.error('Invalid historical data format:', json);
      throw new Error('Invalid historical data format');
    }

    // Process and validate the price data
    const priceData = json.pairs
      .filter(p => {
        const hasRequiredFields = p.priceUsd && p.timestamp;
        if (!hasRequiredFields) {
          console.warn('Skipping invalid data point:', p);
        }
        return hasRequiredFields;
      })
      .map(p => {
        const price = Number(p.priceUsd);
        // Validate the price is reasonable
        if (!isValidPrice(price)) {
          console.warn('Invalid price detected:', price);
          return null;
        }
        
        return {
          date: new Date(p.timestamp * 1000).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          }),
          price: price
        };
      })
      .filter((d): d is TokenPriceData => d !== null);

    if (priceData.length === 0) {
      console.error('No valid price data points found');
      throw new Error('No valid price data available');
    }

    // Sort by date and ensure unique dates
    const uniquePriceData = Array.from(
      new Map(priceData.map(item => [item.date, item])).values()
    );

    uniquePriceData.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    console.log('Processed price data points:', uniquePriceData.length);
    console.log('Sample price data:', uniquePriceData[0]);

    return uniquePriceData;
  } catch (error) {
    console.error('Error fetching historical price data:', error);
    throw error;
  }
};

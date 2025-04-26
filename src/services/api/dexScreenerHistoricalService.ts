
import { TokenPriceData } from '@/types/token';

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
    const res = await fetch(`https://api.dexscreener.com/latest/dex/pairs/polygon/${PAIR}/chart/history`);
    if (!res.ok) throw new Error('DexScreener Historical ' + res.status);
    
    const json: DexScreenerPairData = await res.json();
    
    if (!json.pairs || !Array.isArray(json.pairs)) {
      throw new Error('Invalid historical data format');
    }

    // Convert DexScreener data to our TokenPriceData format
    const priceData = json.pairs
      .filter(p => p.priceUsd && p.timestamp)
      .map(p => ({
        date: new Date(p.timestamp * 1000).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        }),
        price: Number(p.priceUsd)
      }))
      .filter(d => !isNaN(d.price) && d.price > 0);

    // Sort by date
    priceData.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return priceData;
  } catch (error) {
    console.error('Error fetching historical price data:', error);
    throw error;
  }
};

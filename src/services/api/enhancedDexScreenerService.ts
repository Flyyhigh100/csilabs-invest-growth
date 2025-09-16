import { TokenPriceData } from '@/types/token';
import { isValidPrice } from './utils/priceValidation';
import { UNISWAP_V3_POOL } from './config';

export interface OHLCVData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface EnhancedPriceData extends TokenPriceData {
  volume?: number;
  high?: number;
  low?: number;
  open?: number;
}

interface DexScreenerOHLCResponse {
  pair: {
    priceUsd: string;
    volume: {
      h24: number;
    };
    priceChange: {
      h1: number;
      h24: number;
    };
    ohlcv: Array<{
      timestamp: number;
      open: number;
      high: number;
      low: number;
      close: number;
      volume: number;
    }>;
  };
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

async function fetchWithRetry(url: string, retries = MAX_RETRIES): Promise<Response> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response;
  } catch (error) {
    if (retries > 0) {
      console.log(`Retrying fetch... ${retries} attempts remaining`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return fetchWithRetry(url, retries - 1);
    }
    throw error;
  }
}

export const fetchEnhancedDexScreenerData = async (timeframe: '1h' | '4h' | '1d' | '1w' = '1d'): Promise<{
  currentPrice: number;
  priceChange24h: number;
  volume24h: number;
  ohlcvData: OHLCVData[];
}> => {
  try {
    console.log('Fetching enhanced DexScreener data for timeframe:', timeframe);
    
    // Fetch current pair data with OHLCV
    const res = await fetchWithRetry(
      `https://api.dexscreener.com/latest/dex/pairs/polygon/${UNISWAP_V3_POOL}`
    );
    
    const json = await res.json();
    console.log('Enhanced DexScreener response:', json);
    
    if (!json.pair) {
      throw new Error('Invalid enhanced data format');
    }

    const pair = json.pair;
    const currentPrice = parseFloat(pair.priceUsd);
    const priceChange24h = pair.priceChange?.h24 || 0;
    const volume24h = pair.volume?.h24 || 0;

    if (!isValidPrice(currentPrice)) {
      throw new Error(`Invalid current price: ${currentPrice}`);
    }

    // CRITICAL: Do not generate fake OHLCV data - use real DexScreener data only
    console.warn('DexScreener API does not provide detailed OHLCV data - returning empty array');
    const ohlcvData: OHLCVData[] = [];

    return {
      currentPrice,
      priceChange24h,
      volume24h,
      ohlcvData
    };
  } catch (error) {
    console.error('Error fetching enhanced DexScreener data:', error);
    throw error;
  }
};

// REMOVED: generateOHLCVData function removed to prevent fake data generation
// All OHLCV data must come from real DexScreener API calls only

export const fetchEnhancedHistoricalData = async (): Promise<EnhancedPriceData[]> => {
  console.error('CRITICAL: Enhanced historical data requires real DexScreener API data');
  throw new Error('Enhanced historical data not available - no real OHLCV data from DexScreener free API');
};
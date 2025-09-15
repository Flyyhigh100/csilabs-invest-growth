
import { TokenPriceData } from '@/types/token';
import { isValidPrice } from './utils/priceValidation';
import { UNISWAP_V3_POOL } from './config';

interface DexScreenerPairData {
  pairs: Array<{
    priceUsd: string;
    timestamp: number;
  }>;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

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

export const fetchDexScreenerHistorical = async (): Promise<TokenPriceData[]> => {
  try {
    console.log('Fetching historical price data from DexScreener for pair:', UNISWAP_V3_POOL);
    
    const res = await fetchWithRetry(
      `https://api.dexscreener.com/latest/dex/pairs/polygon/${UNISWAP_V3_POOL}/chart/history`
    );
    
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
        const price = Number(parseFloat(p.priceUsd).toFixed(8)); // Maintain 8 decimal precision
        
        if (!isValidPrice(price)) {
          console.warn('Invalid price detected:', price);
          return null;
        }
        
        return {
          date: new Date(p.timestamp * 1000).toISOString().split('T')[0],
          price: price
        };
      })
      .filter((d): d is TokenPriceData => d !== null);

    if (priceData.length === 0) {
      console.error('No valid price data points found');
      throw new Error('No valid price data available');
    }

    // Sort by date and ensure unique dates with latest price for each date
    const priceMap = new Map<string, number>();
    priceData.forEach(item => {
      const existingPrice = priceMap.get(item.date);
      if (!existingPrice || item.price > existingPrice) {
        priceMap.set(item.date, item.price);
      }
    });

    const uniquePriceData = Array.from(priceMap.entries())
      .map(([date, price]) => ({ date, price }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    console.log('Processed price data points:', uniquePriceData.length);
    console.log('Sample price data:', uniquePriceData[0]);
    console.log('Latest price:', uniquePriceData[uniquePriceData.length - 1]);

    return uniquePriceData;
  } catch (error) {
    console.error('Error fetching historical price data:', error);
    throw error;
  }
};

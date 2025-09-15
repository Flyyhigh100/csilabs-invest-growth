import { TokenPriceData } from '@/types/token';
import { UNISWAP_V3_URL, UNISWAP_V3_POOL, V3_TOKEN0, V3_TOKEN1, V3_TOKEN0_DECIMALS, V3_TOKEN1_DECIMALS } from './config';
import { isValidPrice } from './utils/priceValidation';

interface SwapData {
  timestamp: string;
  amount0: string;
  amount1: string;
  sqrtPriceX96: string;
}

interface GraphResponse {
  data: {
    swaps: SwapData[];
  };
}

/**
 * Calculates price from sqrtPriceX96 value
 */
const calculatePriceFromSqrtPriceX96 = (sqrtPriceX96: string, token0Decimals: number, token1Decimals: number): number => {
  const sqrtPrice = parseInt(sqrtPriceX96);
  const price = (sqrtPrice / (2 ** 96)) ** 2;
  const adjustedPrice = price * (10 ** (token0Decimals - token1Decimals));
  return adjustedPrice;
};

/**
 * Fetches historical price data from The Graph Protocol
 */
export const fetchGraphProtocolHistorical = async (): Promise<TokenPriceData[]> => {
  try {
    console.log('Fetching historical data from The Graph Protocol for pool:', UNISWAP_V3_POOL);

    // Get data from the last 90 days
    const thirtyDaysAgo = Math.floor((Date.now() - 90 * 24 * 60 * 60 * 1000) / 1000);

    const query = `
      query {
        swaps(
          first: 1000
          orderBy: timestamp
          orderDirection: desc
          where: {
            pool: "${UNISWAP_V3_POOL}"
            timestamp_gt: ${thirtyDaysAgo}
          }
        ) {
          timestamp
          amount0
          amount1
          sqrtPriceX96
        }
      }
    `;

    const response = await fetch(UNISWAP_V3_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`Graph Protocol request failed: ${response.status}`);
    }

    const data: GraphResponse = await response.json();

    if (!data.data?.swaps || data.data.swaps.length === 0) {
      console.warn('No swap data received from The Graph Protocol');
      return [];
    }

    // Process swaps into daily price data
    const dailyPrices = new Map<string, number>();

    data.data.swaps.forEach(swap => {
      const date = new Date(parseInt(swap.timestamp) * 1000);
      const dateKey = date.toLocaleDateString('en-US', { 
        month: 'short',
        day: 'numeric'
      });

      const price = calculatePriceFromSqrtPriceX96(
        swap.sqrtPriceX96,
        V3_TOKEN0_DECIMALS,
        V3_TOKEN1_DECIMALS
      );

      if (isValidPrice(price)) {
        // Take the most recent price for each day
        if (!dailyPrices.has(dateKey)) {
          dailyPrices.set(dateKey, price);
        }
      }
    });

    // Convert to array and sort by date
    const priceData: TokenPriceData[] = Array.from(dailyPrices.entries())
      .map(([date, price]) => ({ date, price }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    console.log('Graph Protocol data processed:', {
      totalSwaps: data.data.swaps.length,
      dailyPricePoints: priceData.length,
      latestPrice: priceData[priceData.length - 1]?.price
    });

    return priceData;

  } catch (error) {
    console.error('Error fetching from The Graph Protocol:', error);
    return [];
  }
};
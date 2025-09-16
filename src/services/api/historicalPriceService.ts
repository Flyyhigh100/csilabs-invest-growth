
import { TokenPriceData } from '@/types/token';
import { generateMockPriceData } from '../mocks/mockDataGenerators';
import { fetchDexScreenerHistorical } from './dexScreenerHistoricalService';
import { fetchGraphProtocolHistorical } from './graphProtocolService';

export const fetchTokenPriceHistory = async (): Promise<TokenPriceData[]> => {
  try {
    console.log('Fetching token price history with multiple data sources');
    
    // Try The Graph Protocol first (most reliable blockchain data)
    console.log('Attempting to fetch from The Graph Protocol');
    let priceData = await fetchGraphProtocolHistorical();
    
    if (!priceData || priceData.length === 0) {
      console.log('Graph Protocol failed, trying DexScreener');
      priceData = await fetchDexScreenerHistorical();
    }
    
    if (!priceData || priceData.length === 0) {
      console.error('CRITICAL: No real historical data available from any source');
      throw new Error('No real historical data available - will not show simulated data');
    }

    // Validate the data
    if (!priceData.every(d => d.price > 0)) {
      console.error('Invalid price data detected');
      throw new Error('Invalid price data detected from external sources');
    }

    console.log('Real price data validation successful:', { 
      dataPoints: priceData.length,
      firstDate: priceData[0].date,
      lastDate: priceData[priceData.length - 1].date,
      lastPrice: priceData[priceData.length - 1].price
    });

    return priceData;
  } catch (error) {
    console.error('Error fetching token price history:', error);
    // DO NOT return mock data - this is critical for data integrity
    throw error;
  }
};

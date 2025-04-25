
import { TokenPriceData } from '@/types/token';
import { MORALIS_BASE_URL, API_KEY, TOKEN_ADDRESS, MORALIS_CHAIN, START_DATE, END_DATE, DAYS_TO_INCLUDE } from './config';
import { generateMockPriceData } from '../mocks/mockDataGenerators';
import { formatDate } from './utils/dateUtils';

export const fetchTokenPriceHistory = async (): Promise<TokenPriceData[]> => {
  try {
    console.log('Fetching token price history from Moralis');
    
    if (!API_KEY) {
      throw new Error('Moralis API key not configured');
    }

    const daysAgo = Math.floor((Date.now() / 1000 - START_DATE) / 86400);
    const url = `${MORALIS_BASE_URL}/erc20/${TOKEN_ADDRESS}/price/history?chain=${MORALIS_CHAIN}&days=${daysAgo}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-API-Key': API_KEY
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Moralis API error:', errorText);
      throw new Error(`Failed to fetch price history: ${response.status}`);
    }

    const data = await response.json();
    console.log('Received historical price data points:', data.length);

    if (!Array.isArray(data) || data.length === 0) {
      console.warn('No historical price data received, using mock data');
      return generateMockPriceData();
    }

    const formattedData: TokenPriceData[] = data
      .filter((item: any) => item.date && item.price)
      .map((item: any) => ({
        date: formatDate(new Date(item.date).getTime() / 1000),
        price: parseFloat(item.price)
      }))
      .filter(item => !isNaN(item.price) && item.price > 0)
      .slice(-DAYS_TO_INCLUDE); // Only keep the most recent days

    if (formattedData.length === 0) {
      console.warn('No valid price data after processing, using mock data');
      return generateMockPriceData();
    }

    return formattedData;
  } catch (error) {
    console.error('Error fetching token price history:', error);
    return generateMockPriceData();
  }
};

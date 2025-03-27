
import { TokenVolumeData } from '@/types/token';
import { API_BASE_URL, API_KEY, TOKEN_ADDRESS, CHAIN_ID, TIME_RANGE } from './config';
import { generateMockVolumeData } from '../mocks/mockDataGenerators';

/**
 * Fetches historical volume data for a token
 * @returns Promise with volume data array
 */
export const fetchTokenVolumeHistory = async (): Promise<TokenVolumeData[]> => {
  try {
    console.log('Fetching token volume history with API key:', API_KEY ? 'API key present' : 'No API key');
    
    const url = `${API_BASE_URL}/v0/token/${CHAIN_ID}/${TOKEN_ADDRESS}/volume_history?timeRange=${TIME_RANGE}`;
    console.log('Fetching volume history from URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': API_KEY
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error ${response.status}:`, errorText);
      console.log('Using mock data as fallback');
      return generateMockVolumeData();
    }

    const data = await response.json();
    console.log('Volume history data received:', data);
    
    // Transform the API response to match our expected format
    if (data.data && Array.isArray(data.data)) {
      return data.data.map((item: any) => ({
        date: new Date(item.timestamp * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        volume: parseFloat(item.volume_usd) || 0
      }));
    } else {
      console.warn('Unexpected volume history data format:', data);
      console.log('Raw volume data received:', JSON.stringify(data));
      console.log('Using mock data as fallback');
      return generateMockVolumeData();
    }
  } catch (error) {
    console.error('Error fetching token volume history:', error);
    console.log('Using mock data as fallback');
    // Fall back to mock data if the API call fails
    return generateMockVolumeData();
  }
};

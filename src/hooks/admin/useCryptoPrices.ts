
import { useQuery } from '@tanstack/react-query';

export interface CryptoPrice {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
}

const CRYPTO_SYMBOLS = ['bitcoin', 'ethereum', 'matic-network', 'binancecoin', 'solana', 'tether', 'usd-coin'];

export const useCryptoPrices = () => {
  return useQuery({
    queryKey: ['crypto-prices'],
    queryFn: async (): Promise<Record<string, CryptoPrice>> => {
      console.log('Fetching crypto prices from CoinGecko...');
      
      try {
        const response = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${CRYPTO_SYMBOLS.join(',')}&vs_currencies=usd&include_24hr_change=true`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch prices: ${response.statusText}`);
        }

        const data = await response.json();
        
        // Transform the data into our format
        const prices: Record<string, CryptoPrice> = {
          'BTC': {
            symbol: 'BTC',
            name: 'Bitcoin',
            price: data.bitcoin?.usd || 0,
            change24h: data.bitcoin?.usd_24h_change || 0
          },
          'ETH': {
            symbol: 'ETH',
            name: 'Ethereum',
            price: data.ethereum?.usd || 0,
            change24h: data.ethereum?.usd_24h_change || 0
          },
          'MATIC': {
            symbol: 'MATIC',
            name: 'Polygon',
            price: data['matic-network']?.usd || 0,
            change24h: data['matic-network']?.usd_24h_change || 0
          },
          'POL': {
            symbol: 'POL',
            name: 'Polygon',
            price: data['matic-network']?.usd || 0,
            change24h: data['matic-network']?.usd_24h_change || 0
          },
          'BNB': {
            symbol: 'BNB',
            name: 'BNB',
            price: data.binancecoin?.usd || 0,
            change24h: data.binancecoin?.usd_24h_change || 0
          },
          'SOL': {
            symbol: 'SOL',
            name: 'Solana',
            price: data.solana?.usd || 0,
            change24h: data.solana?.usd_24h_change || 0
          },
          'USDT': {
            symbol: 'USDT',
            name: 'Tether',
            price: data.tether?.usd || 1.0,
            change24h: data.tether?.usd_24h_change || 0
          },
          'USDC': {
            symbol: 'USDC',
            name: 'USD Coin',
            price: data['usd-coin']?.usd || 1.0,
            change24h: data['usd-coin']?.usd_24h_change || 0
          }
        };

        console.log('Fetched crypto prices:', Object.keys(prices));
        return prices;
      } catch (error) {
        console.error('Error fetching crypto prices:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
    retry: 2,
  });
};

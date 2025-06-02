
import { useQuery } from '@tanstack/react-query';

export interface CryptoPrice {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
}

const CRYPTO_IDS = ['bitcoin', 'ethereum', 'polygon', 'binance-coin', 'solana', 'tether', 'usd-coin'];

export const useCryptoPrices = () => {
  return useQuery({
    queryKey: ['crypto-prices'],
    queryFn: async (): Promise<Record<string, CryptoPrice>> => {
      console.log('Fetching crypto prices from CoinCap...');
      
      try {
        const response = await fetch(
          `https://api.coincap.io/v2/assets?ids=${CRYPTO_IDS.join(',')}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch prices: ${response.statusText}`);
        }

        const data = await response.json();
        
        // Transform the data into our format
        const prices: Record<string, CryptoPrice> = {};
        
        data.data.forEach((asset: any) => {
          const price = parseFloat(asset.priceUsd) || 0;
          const change24h = parseFloat(asset.changePercent24Hr) || 0;
          
          switch (asset.id) {
            case 'bitcoin':
              prices['BTC'] = {
                symbol: 'BTC',
                name: 'Bitcoin',
                price,
                change24h
              };
              break;
            case 'ethereum':
              prices['ETH'] = {
                symbol: 'ETH',
                name: 'Ethereum',
                price,
                change24h
              };
              break;
            case 'polygon':
              prices['MATIC'] = {
                symbol: 'MATIC',
                name: 'Polygon',
                price,
                change24h
              };
              prices['POL'] = {
                symbol: 'POL',
                name: 'Polygon',
                price,
                change24h
              };
              break;
            case 'binance-coin':
              prices['BNB'] = {
                symbol: 'BNB',
                name: 'BNB',
                price,
                change24h
              };
              break;
            case 'solana':
              prices['SOL'] = {
                symbol: 'SOL',
                name: 'Solana',
                price,
                change24h
              };
              break;
            case 'tether':
              prices['USDT'] = {
                symbol: 'USDT',
                name: 'Tether',
                price: 1.0,
                change24h: 0
              };
              break;
            case 'usd-coin':
              prices['USDC'] = {
                symbol: 'USDC',
                name: 'USD Coin',
                price: 1.0,
                change24h: 0
              };
              break;
          }
        });

        console.log('Fetched crypto prices:', Object.keys(prices));
        return prices;
      } catch (error) {
        console.error('Error fetching crypto prices:', error);
        
        // Fallback to static prices if API fails
        return {
          'BTC': { symbol: 'BTC', name: 'Bitcoin', price: 45000, change24h: 0 },
          'ETH': { symbol: 'ETH', name: 'Ethereum', price: 3000, change24h: 0 },
          'MATIC': { symbol: 'MATIC', name: 'Polygon', price: 0.5, change24h: 0 },
          'POL': { symbol: 'POL', name: 'Polygon', price: 0.5, change24h: 0 },
          'BNB': { symbol: 'BNB', name: 'BNB', price: 600, change24h: 0 },
          'SOL': { symbol: 'SOL', name: 'Solana', price: 100, change24h: 0 },
          'USDT': { symbol: 'USDT', name: 'Tether', price: 1.0, change24h: 0 },
          'USDC': { symbol: 'USDC', name: 'USD Coin', price: 1.0, change24h: 0 }
        };
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
    retry: 2,
  });
};

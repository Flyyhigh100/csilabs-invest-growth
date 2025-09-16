import { makeDexScreenerCall } from './api/proxyService';

export interface DexScreenerPair {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  quoteToken: {
    address: string;
    name: string;
    symbol: string;
  };
  priceNative: string;
  priceUsd: string;
  txns: {
    m5: { buys: number; sells: number };
    h1: { buys: number; sells: number };
    h6: { buys: number; sells: number };
    h24: { buys: number; sells: number };
  };
  volume: {
    h24: number;
    h6: number;
    h1: number;
    m5: number;
  };
  priceChange: {
    m5: number;
    h1: number;
    h6: number;
    h24: number;
  };
  liquidity?: {
    usd?: number;
    base: number;
    quote: number;
  };
  fdv?: number;
  marketCap?: number;
  pairCreatedAt?: number;
}

export interface TokenPairsResponse {
  schemaVersion: string;
  pairs: DexScreenerPair[];
}

export interface ChartData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

class DexScreenerService {
  private static instance: DexScreenerService;
  private selectedPair: DexScreenerPair | null = null;
  private lastPrice: number = 0;
  private priceHistory: { time: number; price: number }[] = [];

  public static getInstance(): DexScreenerService {
    if (!DexScreenerService.instance) {
      DexScreenerService.instance = new DexScreenerService();
    }
    return DexScreenerService.instance;
  }

  async findMostLiquidPair(tokenAddress: string): Promise<DexScreenerPair | null> {
    try {
      console.log('[DEXSCREENER] Fetching token pairs for:', tokenAddress);
      
      const response = await fetch(`https://api.dexscreener.com/token-pairs/v1/polygon/${tokenAddress}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: TokenPairsResponse = await response.json();
      console.log('[DEXSCREENER] Token pairs response:', data);

      if (!data.pairs || data.pairs.length === 0) {
        console.warn('[DEXSCREENER] No pairs found for token');
        return null;
      }

      // Find pair with highest liquidity
      const mostLiquidPair = data.pairs
        .filter(pair => pair.liquidity?.usd && pair.liquidity.usd > 0)
        .sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))[0];

      if (!mostLiquidPair) {
        // Fallback to first pair if no liquidity data
        this.selectedPair = data.pairs[0];
        console.warn('[DEXSCREENER] No liquidity data found, using first pair:', this.selectedPair.pairAddress);
      } else {
        this.selectedPair = mostLiquidPair;
        console.log('[DEXSCREENER] Selected most liquid pair:', {
          pairAddress: this.selectedPair.pairAddress,
          liquidity: this.selectedPair.liquidity?.usd,
          symbol: `${this.selectedPair.baseToken.symbol}/${this.selectedPair.quoteToken.symbol}`
        });
      }

      return this.selectedPair;
    } catch (error) {
      console.error('[DEXSCREENER] Error fetching token pairs:', error);
      return null;
    }
  }

  async fetchPairData(pairAddress?: string): Promise<DexScreenerPair | null> {
    try {
      const targetPairAddress = pairAddress || this.selectedPair?.pairAddress;
      if (!targetPairAddress) {
        console.error('[DEXSCREENER] No pair address available');
        return null;
      }

      console.log('[DEXSCREENER] Fetching pair data for:', targetPairAddress);
      
      const response = await fetch(`https://api.dexscreener.com/latest/dex/pairs/polygon/${targetPairAddress}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('[DEXSCREENER] Pair data response:', data);

      if (data.pair) {
        const currentPrice = parseFloat(data.pair.priceUsd);
        const currentTime = Date.now();
        
        // Store price history for chart
        this.priceHistory.push({ time: currentTime, price: currentPrice });
        
        // Keep only last 100 data points
        if (this.priceHistory.length > 100) {
          this.priceHistory = this.priceHistory.slice(-100);
        }
        
        this.lastPrice = currentPrice;
        return data.pair;
      }

      return null;
    } catch (error) {
      console.error('[DEXSCREENER] Error fetching pair data:', error);
      return null;
    }
  }

  generateChartData(): ChartData[] {
    if (this.priceHistory.length < 2) {
      return [];
    }

    // Generate OHLC data from price history
    const chartData: ChartData[] = [];
    const timeInterval = 60000; // 1 minute intervals

    for (let i = 0; i < this.priceHistory.length - 1; i++) {
      const current = this.priceHistory[i];
      const next = this.priceHistory[i + 1];
      
      // Create candlestick data
      const open = current.price;
      const close = next.price;
      const high = Math.max(open, close) * (1 + Math.random() * 0.002); // Small random wick
      const low = Math.min(open, close) * (1 - Math.random() * 0.002); // Small random wick
      
      chartData.push({
        time: Math.floor(current.time / 1000), // Convert to seconds for TradingView
        open,
        high,
        low,
        close,
        volume: Math.random() * 10000 // Placeholder volume
      });
    }

    return chartData;
  }

  getCurrentPrice(): number {
    return this.lastPrice;
  }

  getSelectedPair(): DexScreenerPair | null {
    return this.selectedPair;
  }

  getPriceHistory(): { time: number; price: number }[] {
    return this.priceHistory;
  }
}

export default DexScreenerService;

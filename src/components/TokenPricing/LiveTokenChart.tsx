import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import { DEFAULT_TOKEN_ADDRESS, WETH_TOKEN_ADDRESS, DEFAULT_TOKEN_SYMBOL } from '@/config/token';

const POLL_INTERVAL = 20000; // 20 seconds

interface ChartDataPoint {
  time: string;
  price: number;
  timestamp: number;
}

interface DexScreenerPair {
  chainId: string;
  dexId: string;
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
  priceUsd: string;
  priceChange: {
    h24: number;
  };
  liquidity?: {
    usd?: number;
  };
  volume: {
    h24: number;
  };
}

interface TokenPairsResponse {
  pairs: DexScreenerPair[];
}

const LiveTokenChart: React.FC = () => {
  const pollIntervalRef = useRef<NodeJS.Timeout>();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [priceChange, setPriceChange] = useState<number>(0);
  const [pairInfo, setPairInfo] = useState<string>('');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [selectedPair, setSelectedPair] = useState<DexScreenerPair | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [currentTokenAddress, setCurrentTokenAddress] = useState(DEFAULT_TOKEN_ADDRESS);

  const findMostLiquidPair = async (tokenAddress: string): Promise<DexScreenerPair | null> => {
    try {
      console.log('[LIVE CHART] Fetching token pairs for:', tokenAddress);
      
      const response = await fetch(`https://api.dexscreener.com/token-pairs/v1/polygon/${tokenAddress}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data: TokenPairsResponse = await response.json();
      console.log('[LIVE CHART] Token pairs response:', data);

      if (!data.pairs || data.pairs.length === 0) {
        console.warn('[LIVE CHART] No pairs found for token');
        return null;
      }

      // Find pair with highest liquidity
      const mostLiquidPair = data.pairs
        .filter(pair => pair.liquidity?.usd && pair.liquidity.usd > 0)
        .sort((a, b) => (b.liquidity?.usd || 0) - (a.liquidity?.usd || 0))[0];

      if (!mostLiquidPair) {
        // Fallback to first pair if no liquidity data
        console.warn('[LIVE CHART] No liquidity data found, using first pair');
        return data.pairs[0];
      }

      console.log('[LIVE CHART] Selected most liquid pair:', {
        pairAddress: mostLiquidPair.pairAddress,
        liquidity: mostLiquidPair.liquidity?.usd,
        symbol: `${mostLiquidPair.baseToken.symbol}/${mostLiquidPair.quoteToken.symbol}`
      });

      return mostLiquidPair;
    } catch (error) {
      console.error('[LIVE CHART] Error fetching token pairs:', error);
      return null;
    }
  };

  const fetchPairData = async (pairAddress: string): Promise<DexScreenerPair | null> => {
    try {
      console.log('[LIVE CHART] Fetching pair data for:', pairAddress);
      
      const response = await fetch(`https://api.dexscreener.com/latest/dex/pairs/polygon/${pairAddress}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('[LIVE CHART] Pair data response:', data);

      return data.pair || null;
    } catch (error) {
      console.error('[LIVE CHART] Error fetching pair data:', error);
      return null;
    }
  };


  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('[LIVE CHART] Loading initial data for token:', currentTokenAddress);
      
      // Try with the current token first
      let pair = await findMostLiquidPair(currentTokenAddress);
      
      // If no pairs found and we're using CSL token, fallback to WETH for demonstration
      if (!pair && currentTokenAddress === DEFAULT_TOKEN_ADDRESS) {
        console.log('[LIVE CHART] No pairs found for CSL token, trying with WETH as fallback...');
        pair = await findMostLiquidPair(WETH_TOKEN_ADDRESS);
        if (pair) {
          setCurrentTokenAddress(WETH_TOKEN_ADDRESS);
          console.log('[LIVE CHART] Successfully switched to WETH for live data');
        }
      }
      
      if (!pair) {
        throw new Error(`No trading pairs found for this token (${currentTokenAddress}). This token may not have active trading on DEX exchanges.`);
      }

      setSelectedPair(pair);
      setPairInfo(`${pair.baseToken.symbol}/${pair.quoteToken.symbol}`);
      
      // Fetch initial pair data
      const pairData = await fetchPairData(pair.pairAddress);
      if (pairData) {
        const price = parseFloat(pairData.priceUsd);
        setCurrentPrice(price);
        setPriceChange(pairData.priceChange?.h24 || 0);
        
        // Initialize chart with current price
        const now = new Date();
        const initialData: ChartDataPoint = {
          time: now.toLocaleTimeString(),
          price: price,
          timestamp: now.getTime()
        };
        
        setChartData([initialData]);
        console.log('[LIVE CHART] Initial chart data set:', price);
      }

      setLastUpdate(new Date());
      setIsLoading(false);
    } catch (err) {
      console.error('[LIVE CHART] Error loading initial data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load chart data');
      setIsLoading(false);
    }
  };

  const updateChart = async () => {
    try {
      if (!selectedPair) return;

      console.log('[LIVE CHART] Updating chart data...');
      
      // Fetch latest pair data
      const pairData = await fetchPairData(selectedPair.pairAddress);
      if (pairData) {
        const price = parseFloat(pairData.priceUsd);
        setCurrentPrice(price);
        setPriceChange(pairData.priceChange?.h24 || 0);
        
        // Add new data point to chart
        const now = new Date();
        const newDataPoint: ChartDataPoint = {
          time: now.toLocaleTimeString(),
          price: price,
          timestamp: now.getTime()
        };
        
        setChartData(prevData => {
          const updatedData = [...prevData, newDataPoint];
          // Keep only last 50 data points
          return updatedData.slice(-50);
        });
        
        console.log('[LIVE CHART] Chart updated with latest price:', price);
        
        setLastUpdate(new Date());
      }
    } catch (err) {
      console.error('[LIVE CHART] Error updating chart:', err);
    }
  };

  const startPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
    
    pollIntervalRef.current = setInterval(updateChart, POLL_INTERVAL);
    console.log('[LIVE CHART] Started polling every', POLL_INTERVAL / 1000, 'seconds');
  };

  const stopPolling = () => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = undefined;
      console.log('[LIVE CHART] Stopped polling');
    }
  };

  const handleRefresh = async () => {
    stopPolling();
    setChartData([]);
    await loadInitialData();
    startPolling();
  };

  useEffect(() => {
    loadInitialData().then(() => {
      startPolling();
    });

    return () => {
      stopPolling();
    };
  }, []);

  const formatPrice = (price: number) => {
    if (price < 0.01) {
      return `$${price.toFixed(6)}`;
    } else if (price < 1) {
      return `$${price.toFixed(4)}`;
    }
    return `$${price.toFixed(2)}`;
  };

  const formatChange = (change: number) => {
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toFixed(2)}%`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm text-muted-foreground">{`Time: ${label}`}</p>
          <p className="text-sm font-medium">
            {`Price: ${formatPrice(payload[0].value)}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Live Token Chart {pairInfo && `(${pairInfo})`}
              {currentTokenAddress !== DEFAULT_TOKEN_ADDRESS && (
                <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                  Demo Mode (WETH)
                </span>
              )}
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
              <span>Updates every {POLL_INTERVAL / 1000}s</span>
              {selectedPair && (
                <span className="text-xs">
                  Pair: {selectedPair.pairAddress.slice(0, 6)}...{selectedPair.pairAddress.slice(-4)}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {currentPrice > 0 && (
              <div className="text-right">
                <div className="text-xl font-bold">{formatPrice(currentPrice)}</div>
                <div className={`flex items-center gap-1 text-sm ${
                  priceChange >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {priceChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {formatChange(priceChange)} (24h)
                </div>
              </div>
            )}
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        {error ? (
          <div className="flex items-center justify-center h-[520px] text-center">
            <div className="space-y-2">
              <div className="text-red-600 font-medium">Chart Error</div>
              <div className="text-sm text-muted-foreground max-w-md">{error}</div>
              <div className="text-xs text-muted-foreground">
                Try with a different token address or check if the token has active trading pairs.
              </div>
              <Button onClick={handleRefresh} size="sm">
                Try Again
              </Button>
            </div>
          </div>
        ) : (
          <div className="relative">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/50 z-10">
                <div className="text-muted-foreground flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Loading live chart data...
                </div>
              </div>
            )}
            <div className="w-full h-[520px] p-4">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="time" 
                      className="text-xs"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis 
                      domain={['dataMin', 'dataMax']}
                      className="text-xs"
                      tick={{ fontSize: 12 }}
                      tickFormatter={formatPrice}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line 
                      type="monotone" 
                      dataKey="price" 
                      stroke="hsl(var(--chart-1))" 
                      strokeWidth={2}
                      dot={false}
                      activeDot={{ r: 4, stroke: "hsl(var(--chart-1))", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <div>Waiting for price data...</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LiveTokenChart;
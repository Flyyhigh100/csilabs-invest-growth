import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip } from 'recharts';
import DexScreenerService from '@/services/dexScreenerService';

const TOKEN_ADDRESS = '0xcba5ca199bca0af3f6046da01169035f2c6a7ff0';
const POLL_INTERVAL = 20000; // 20 seconds

interface ChartDataPoint {
  time: string;
  price: number;
  timestamp: number;
}

const LiveTokenChart: React.FC = () => {
  const pollIntervalRef = useRef<NodeJS.Timeout>();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [priceChange, setPriceChange] = useState<number>(0);
  const [pairInfo, setPairInfo] = useState<string>('');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  const dexScreenerService = DexScreenerService.getInstance();

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('[LIVE CHART] Loading initial data...');
      
      // Find the most liquid pair
      const pair = await dexScreenerService.findMostLiquidPair(TOKEN_ADDRESS);
      if (!pair) {
        throw new Error('No trading pairs found for this token');
      }

      setPairInfo(`${pair.baseToken.symbol}/${pair.quoteToken.symbol}`);
      
      // Fetch initial pair data to start price history
      const pairData = await dexScreenerService.fetchPairData(pair.pairAddress);
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
      console.log('[LIVE CHART] Updating chart data...');
      
      const pair = dexScreenerService.getSelectedPair();
      if (!pair) return;

      // Fetch latest pair data
      const pairData = await dexScreenerService.fetchPairData(pair.pairAddress);
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
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>Last updated: {lastUpdate.toLocaleTimeString()}</span>
              <span>Updates every {POLL_INTERVAL / 1000}s</span>
              <span>{chartData.length} data points</span>
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
              <div className="text-sm text-muted-foreground">{error}</div>
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

import React, { useState, useMemo } from 'react';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RefreshCw, TrendingUp, TrendingDown, BarChart3, LineChart, AreaChart as AreaChartIcon, ExternalLink } from "lucide-react";
import { useTokenPrice } from '@/context/TokenPriceContext';
import { usePriceHistory } from '@/hooks/token/usePriceHistory';
import { formatCurrency } from '@/utils/format';
import { UNISWAP_V3_POOL } from '@/services/api/config';
import { toast } from "@/components/ui/use-toast";
import DataIntegrityNotice from './DataIntegrityNotice';

type ChartType = 'line' | 'area' | 'candlestick';
type TimeFrame = '1h' | '4h' | '1d' | '1w';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        <p className="text-sm text-muted-foreground mb-1">{`Date: ${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm font-medium">
            <span style={{ color: entry.color }}>{entry.name}: </span>
            {entry.name === 'Volume' 
              ? `${Number(entry.value).toLocaleString()}`
              : formatCurrency(entry.value, 'USD')
            }
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const EnhancedTokenChart = () => {
  const [chartType, setChartType] = useState<ChartType>('area');
  const [timeFrame, setTimeFrame] = useState<TimeFrame>('1d');
  
  const { 
    currentPrice, 
    isLoading: isPriceLoading, 
    refreshPrice, 
    dataSource,
    lastUpdated 
  } = useTokenPrice();
  
  const { 
    data: historicalData = [], 
    isLoading: isHistoryLoading,
    refetch: refetchHistory 
  } = usePriceHistory();

  // Calculate 24h change
  const priceChange24h = useMemo(() => {
    if (!historicalData.length || !currentPrice) return null;
    
    const yesterday = historicalData[historicalData.length - 2];
    const today = historicalData[historicalData.length - 1];
    
    if (!yesterday || !today) return null;
    
    const change = ((today.price - yesterday.price) / yesterday.price) * 100;
    return change;
  }, [historicalData, currentPrice]);

  const isPositiveChange = priceChange24h !== null && priceChange24h > 0;

  const handleRefresh = async () => {
    try {
      await Promise.all([refreshPrice(), refetchHistory()]);
      toast({
        title: "Data Refreshed",
        description: "Latest price and chart data has been updated.",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Unable to refresh data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleViewOnDexScreener = () => {
    window.open(`https://dexscreener.com/polygon/${UNISWAP_V3_POOL}`, '_blank');
  };

  const formatXAxisTick = (tickItem: string) => {
    const date = new Date(tickItem);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const chartData = useMemo(() => {
    return historicalData.map(item => ({
      date: item.date,
      price: item.price,
      // REMOVED: No fake volume data - only show price data from real sources
      formattedDate: formatXAxisTick(item.date)
    }));
  }, [historicalData]);

  const renderChart = () => {
    if (!chartData.length) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground space-y-2">
          <p className="text-lg font-medium">No Real Historical Data Available</p>
          <p className="text-sm text-center max-w-md">
            DexScreener API does not provide sufficient historical data for this token pair. 
            For complete historical data, please visit DexScreener directly.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewOnDexScreener}
            className="flex items-center gap-1 mt-2"
          >
            <ExternalLink className="w-4 h-4" />
            View Full Data on DexScreener
          </Button>
        </div>
      );
    }

    switch (chartType) {
      case 'area':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="formattedDate" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickFormatter={(value) => `$${value.toFixed(4)}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="price" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                fill="url(#priceGradient)"
                name="Price"
              />
            </AreaChart>
          </ResponsiveContainer>
        );
      
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="formattedDate" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                yAxisId="price"
                orientation="left"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickFormatter={(value) => `$${value.toFixed(4)}`}
              />
              <Tooltip content={<CustomTooltip />} />
              {/* REMOVED: Volume bars - no real volume data available */}
              <Line 
                yAxisId="price"
                type="monotone" 
                dataKey="price" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={false}
                name="Price"
              />
            </ComposedChart>
          </ResponsiveContainer>
        );

      default:
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="formattedDate" 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickFormatter={(value) => `$${value.toFixed(4)}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="price" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                fill="url(#priceGradient)"
                name="Price"
              />
            </AreaChart>
          </ResponsiveContainer>
        );
    }
  };

  return (
    <div className="w-full space-y-4">
      <DataIntegrityNotice />
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="space-y-1">
          <CardTitle className="text-2xl font-bold">
            CSL Token Price Chart
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold">
              {currentPrice ? formatCurrency(currentPrice, 'USD') : '--'}
            </span>
            {priceChange24h !== null && (
              <Badge variant={isPositiveChange ? "default" : "destructive"} className="flex items-center gap-1">
                {isPositiveChange ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {isPositiveChange ? '+' : ''}{priceChange24h.toFixed(2)}%
              </Badge>
            )}
          </div>
          <div className="text-sm text-muted-foreground space-y-1">
            <p>
              <strong>Current Price Source:</strong> {dataSource} • Last updated: {lastUpdated ? new Date(lastUpdated).toLocaleTimeString() : 'N/A'}
            </p>
            <p className="text-xs">
              <strong>Historical Data:</strong> Real data from DexScreener API when available. No simulated or mock data is displayed.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewOnDexScreener}
            className="flex items-center gap-1"
          >
            <ExternalLink className="w-4 h-4" />
            DexScreener
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isPriceLoading || isHistoryLoading}
            className="flex items-center gap-1"
          >
            <RefreshCw className={`w-4 h-4 ${(isPriceLoading || isHistoryLoading) ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Chart Type Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Chart Type:</span>
              <div className="flex gap-1">
                <Button
                  variant={chartType === 'area' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartType('area')}
                  className="flex items-center gap-1"
                >
                  <AreaChartIcon className="w-4 h-4" />
                  Area
                </Button>
                <Button
                  variant={chartType === 'line' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setChartType('line')}
                  className="flex items-center gap-1"
                >
                  <LineChart className="w-4 h-4" />
                  Line
                </Button>
              </div>
            </div>
            
            {/* Timeframe Controls */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Timeframe:</span>
              <div className="flex gap-1">
                {(['1d', '1w'] as TimeFrame[]).map((tf) => (
                  <Button
                    key={tf}
                    variant={timeFrame === tf ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTimeFrame(tf)}
                  >
                    {tf.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="mt-6">
            {isHistoryLoading ? (
              <div className="flex items-center justify-center h-64">
                <RefreshCw className="w-6 h-6 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading chart data...</span>
              </div>
            ) : (
              renderChart()
            )}
          </div>
        </div>
      </CardContent>
    </Card>
    </div>
  );
};

export default EnhancedTokenChart;
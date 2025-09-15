import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, TrendingUp, TrendingDown, ExternalLink } from "lucide-react";
import { useTokenPrice } from '@/context/TokenPriceContext';
import { usePriceHistory } from '@/hooks/token/usePriceHistory';
import { formatCurrency } from '@/utils/format';
import { UNISWAP_V3_POOL } from '@/services/api/config';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
        <p className="text-sm text-muted-foreground">{`Date: ${label}`}</p>
        <p className="text-sm font-medium">
          <span className="text-primary">Price: </span>
          {formatCurrency(payload[0].value, 'USD')}
        </p>
      </div>
    );
  }
  return null;
};

const CustomTokenChart = () => {
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

  // Calculate 24h change if we have historical data
  const calculate24hChange = () => {
    if (!historicalData.length || !currentPrice) return null;
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const yesterdayPrice = historicalData.find(d => {
      const dataDate = new Date(d.date);
      return Math.abs(dataDate.getTime() - yesterday.getTime()) < 24 * 60 * 60 * 1000;
    })?.price;
    
    if (!yesterdayPrice) return null;
    
    const change = ((currentPrice - yesterdayPrice) / yesterdayPrice) * 100;
    return change;
  };

  const priceChange24h = calculate24hChange();
  const isPositiveChange = priceChange24h && priceChange24h > 0;

  const handleRefresh = async () => {
    await Promise.all([refreshPrice(), refetchHistory()]);
  };

  const getSourceBadgeVariant = () => {
    switch (dataSource) {
      case 'on-chain-v3':
      case 'on-chain-v4':
        return 'default';
      case 'defined.fi':
        return 'secondary';
      case 'dexscreener':
        return 'outline';
      case 'cache':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getSourceDisplayName = () => {
    switch (dataSource) {
      case 'on-chain-v3':
        return 'Uniswap V3';
      case 'on-chain-v4':
        return 'Uniswap V4';
      case 'defined.fi':
        return 'Defined.fi';
      case 'dexscreener':
        return 'DexScreener';
      case 'cache':
        return 'Cached';
      default:
        return 'Unknown';
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">Token Price Chart</CardTitle>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={getSourceBadgeVariant()}>
                {getSourceDisplayName()}
              </Badge>
              {lastUpdated && (
                <span className="text-xs text-muted-foreground">
                  Updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`https://dexscreener.com/polygon/${UNISWAP_V3_POOL}`, '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
              Verify
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isPriceLoading || isHistoryLoading}
            >
              <RefreshCw className={`h-4 w-4 ${(isPriceLoading || isHistoryLoading) ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
        
        {/* Current Price Display */}
        <div className="flex items-center gap-4 mt-4">
          <div className="text-3xl font-bold">
            {currentPrice ? formatCurrency(currentPrice, 'USD') : '$--'}
          </div>
          {priceChange24h !== null && (
            <div className={`flex items-center gap-1 text-sm font-medium ${
              isPositiveChange ? 'text-green-600' : 'text-red-600'
            }`}>
              {isPositiveChange ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              {Math.abs(priceChange24h).toFixed(2)}%
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="h-64 w-full">
          {isHistoryLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-muted-foreground">Loading price history...</div>
            </div>
          ) : historicalData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historicalData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  }}
                  className="text-xs"
                />
                <YAxis 
                  domain={['dataMin * 0.95', 'dataMax * 1.05']}
                  tickFormatter={(value) => `$${value.toFixed(4)}`}
                  className="text-xs"
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center text-muted-foreground">
                <p>No historical data available</p>
                <Button variant="outline" size="sm" onClick={() => refetchHistory()} className="mt-2">
                  Try Again
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomTokenChart;
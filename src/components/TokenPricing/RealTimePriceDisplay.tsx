import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, RefreshCw, ExternalLink, Clock } from "lucide-react";
import { useTokenPrice } from '@/context/TokenPriceContext';
import { formatDistanceToNow } from 'date-fns';
const RealTimePriceDisplay = () => {
  const {
    currentPrice,
    isLoading,
    error,
    lastUpdated,
    timeUntilNextUpdate,
    dataSource,
    refreshPrice
  } = useTokenPrice();
  const handleViewOnDexTools = () => {
    window.open('https://www.dextools.io/app/en/polygon/pair-explorer/0xb85372c56884a906ab33c0e99fea572c7c6ad7eb?t=1758021595477', '_blank');
  };
  const handleRefresh = () => {
    refreshPrice();
  };
  if (error) {
    return <Card className="border-destructive/20 bg-destructive/5">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <p className="text-destructive">Unable to load current price data</p>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>;
  }
  return <div className="space-y-4">
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between">
            <span>Real-Time Token Price</span>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {dataSource || 'Live'}
              </Badge>
              <Button onClick={handleRefresh} variant="ghost" size="sm" disabled={isLoading}>
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Main Price Display */}
          <div className="text-center space-y-2">
            <div className="text-4xl font-bold text-primary">
              {isLoading ? <div className="animate-pulse bg-muted h-12 w-32 rounded mx-auto" /> : `$${currentPrice?.toFixed(6) || '0.000000'}`}
            </div>
            <p className="text-muted-foreground text-sm">
              Current token price in USD
            </p>
          </div>

          {/* Data Source & Timestamp */}
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            {lastUpdated && <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>
                  Updated {formatDistanceToNow(lastUpdated, {
                addSuffix: true
              })}
                </span>
              </div>}
            {timeUntilNextUpdate && <div className="text-xs">
                Next update in {Math.ceil(timeUntilNextUpdate / 1000)}s
              </div>}
          </div>

          {/* External Verification */}
          <div className="flex justify-center">
            
          </div>
        </CardContent>
      </Card>

      {/* Data Integrity Notice */}
      <Card className="border-amber-200/50 bg-amber-50/50 dark:border-amber-700/50 dark:bg-amber-900/10">
        <CardContent className="pt-4">
          
        </CardContent>
      </Card>
    </div>;
};
export default RealTimePriceDisplay;
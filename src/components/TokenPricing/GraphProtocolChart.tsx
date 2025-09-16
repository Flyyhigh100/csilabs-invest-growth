import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ExternalLink, TrendingUp, AlertCircle } from "lucide-react";
import { usePriceHistory } from '@/hooks/token/usePriceHistory';
import { UNISWAP_V3_POOL } from '@/services/api/config';

const GraphProtocolChart = () => {
  const { data: priceData = [], isLoading, error } = usePriceHistory();

  const handleViewOnDexScreener = () => {
    window.open(`https://dexscreener.com/polygon/${UNISWAP_V3_POOL}`, '_blank');
  };

  if (error) {
    return (
      <Card className="border-destructive/20 bg-destructive/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Historical Data Unavailable
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Unable to load historical swap data from The Graph Protocol. 
            This may be due to limited trading history or API availability.
          </p>
          <Button
            variant="outline"
            onClick={handleViewOnDexScreener}
            className="flex items-center gap-2"
          >
            <ExternalLink className="w-4 h-4" />
            View Live Data on DexScreener
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historical Price Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">
              Loading real blockchain swap data...
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!priceData || priceData.length === 0) {
    return (
      <Card className="border-amber-200/50 bg-amber-50/50 dark:border-amber-700/50 dark:bg-amber-900/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Limited Historical Data
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            No sufficient historical swap data is available from The Graph Protocol. 
            This is common for newly launched tokens or tokens with limited trading activity.
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleViewOnDexScreener}
              className="flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Check Current Data on DexScreener
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Historical Swap Data (The Graph Protocol)</span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleViewOnDexScreener}
            className="flex items-center gap-1"
          >
            <ExternalLink className="w-3 h-3" />
            Verify
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={priceData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                className="text-xs fill-muted-foreground"
                tick={{ fontSize: 10 }}
              />
              <YAxis 
                className="text-xs fill-muted-foreground"
                tick={{ fontSize: 10 }}
                tickFormatter={(value) => `$${value.toFixed(6)}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '6px',
                }}
                formatter={(value: number) => [`$${value.toFixed(6)}`, 'Price']}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
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
        </div>
        <div className="mt-4 text-xs text-muted-foreground">
          <p>
            Data sourced from real Uniswap V3 swaps via The Graph Protocol. 
            Shows actual trading activity for the last 90 days.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default GraphProtocolChart;
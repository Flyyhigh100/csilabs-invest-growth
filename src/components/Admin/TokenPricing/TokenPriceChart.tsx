
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DexToolsChart from '@/components/TokenPricing/DexToolsChart';

const TokenPriceChart: React.FC = () => {
  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Token Price Chart</span>
        </CardTitle>
        <CardDescription>Real-time price data powered by DexTools</CardDescription>
      </CardHeader>
      <CardContent>
        <DexToolsChart />
      </CardContent>
    </Card>
  );
};

export default TokenPriceChart;

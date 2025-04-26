
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import DexToolsChart from '@/components/TokenPricing/DexToolsChart';
import { TokenPriceData } from '@/types/token';

interface TokenPriceChartProps {
  priceData?: TokenPriceData[];
  isHistoryLoading?: boolean;
  refreshAllData?: () => void;
}

const TokenPriceChart: React.FC<TokenPriceChartProps> = ({ 
  priceData, 
  isHistoryLoading, 
  refreshAllData 
}) => {
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

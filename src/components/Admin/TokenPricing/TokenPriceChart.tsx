
import React from 'react';
import TokenChart from '@/components/TokenPricing/TokenChart';
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
    <div className="col-span-1 lg:col-span-2">
      <TokenChart />
    </div>
  );
};

export default TokenPriceChart;

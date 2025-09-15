
import React from 'react';
import CustomTokenChart from '@/components/TokenPricing/CustomTokenChart';
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
      <CustomTokenChart />
    </div>
  );
};

export default TokenPriceChart;

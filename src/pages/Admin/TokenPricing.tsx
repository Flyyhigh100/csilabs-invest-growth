
import React from 'react';
import AdminLayout from '@/components/Admin/Layout';
import TokenPriceChart from '@/components/Admin/TokenPricing/TokenPriceChart';
import CurrentPriceCard from '@/components/Admin/TokenPricing/CurrentPriceCard';
import { useTokenData } from '@/hooks/useTokenData';
import { TokenPriceProvider, useTokenPrice } from '@/context/TokenPriceContext';
import { PriceDebugger } from '@/components/Admin/TokenPricing/PriceDebugger';

const TokenPricingContent = () => {
  const { 
    currentPrice,
    priceData, 
    isLoading,
    refreshAllData
  } = useTokenData();
  
  // Get data from context
  const { dataSource, lastUpdated, timeUntilNextUpdate, refreshPrice } = useTokenPrice();
  
  // Calculate derived values
  const formattedLastUpdated = lastUpdated ? lastUpdated.toLocaleTimeString() : 'Not available';
  const secondsUntilRefresh = Math.ceil(timeUntilNextUpdate / 1000);
    
  return (
    <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
      <TokenPriceChart 
        priceData={priceData} 
        isHistoryLoading={isLoading}
        refreshAllData={refreshAllData}
      />
      
      <div className="space-y-6">
        <CurrentPriceCard 
          currentPrice={currentPrice}
          isPriceLoading={isLoading}
          refreshPrice={refreshPrice}
          formattedLastUpdated={formattedLastUpdated}
          secondsUntilRefresh={secondsUntilRefresh}
          dataSource={dataSource}
        />
        
        <PriceDebugger />
      </div>
    </div>
  );
};

const TokenPricingPage = () => {
  return (
    <AdminLayout title="Token Pricing">
      <TokenPriceProvider>
        <TokenPricingContent />
      </TokenPriceProvider>
    </AdminLayout>
  );
};

export default TokenPricingPage;

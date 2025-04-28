
import React from 'react';
import AdminLayout from '@/components/Admin/Layout';
import TokenPriceChart from '@/components/Admin/TokenPricing/TokenPriceChart';
import CurrentPriceCard from '@/components/Admin/TokenPricing/CurrentPriceCard';
import { useTokenData } from '@/hooks/useTokenData';
import { TokenPriceProvider } from '@/context/TokenPriceContext';

const TokenPricingPage = () => {
  const { 
    currentPrice,
    priceData, 
    isLoading,
    refreshAllData
  } = useTokenData();
  
  // Calculate derived values
  const lastUpdated = new Date(); // This is a placeholder - the real data would come from the hook
  const timeUntilNextUpdate = 30000; // 30 seconds placeholder
  const formattedLastUpdated = lastUpdated.toLocaleTimeString();
  const secondsUntilRefresh = Math.ceil(timeUntilNextUpdate / 1000);
    
  return (
    <AdminLayout title="Token Pricing">
      <TokenPriceProvider>
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
          <TokenPriceChart 
            priceData={priceData} 
            isHistoryLoading={isLoading}
            refreshAllData={refreshAllData}
          />
          
          <CurrentPriceCard 
            currentPrice={currentPrice}
            isPriceLoading={isLoading}
            refreshPrice={refreshAllData}
            formattedLastUpdated={formattedLastUpdated}
            secondsUntilRefresh={secondsUntilRefresh}
          />
        </div>
      </TokenPriceProvider>
    </AdminLayout>
  );
};

export default TokenPricingPage;


import React from 'react';
import AdminLayout from '@/components/Admin/Layout';
import TokenPriceChart from '@/components/Admin/TokenPricing/TokenPriceChart';
import CurrentPriceCard from '@/components/Admin/TokenPricing/CurrentPriceCard';
import { useTokenData } from '@/hooks/useTokenData';
import { TokenPriceProvider, useTokenPrice } from '@/context/TokenPriceContext';
import { PriceDebugger } from '@/components/Admin/TokenPricing/PriceDebugger';
import PriceSourceDiagnostic from '@/components/Admin/TokenPricing/PriceSourceDiagnostic';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const TokenPricingContent = () => {
  const { 
    priceData, 
    isLoading,
    refreshAllData
  } = useTokenData();
  
  // Get data from context - this is now safely inside the provider
  const { 
    currentPrice,
    dataSource, 
    lastUpdated, 
    timeUntilNextUpdate, 
    refreshPrice 
  } = useTokenPrice();
  
  // Calculate derived values
  const formattedLastUpdated = lastUpdated ? lastUpdated.toLocaleTimeString() : 'Not available';
  const secondsUntilRefresh = Math.ceil(timeUntilNextUpdate / 1000);
    
  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
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
        </TabsContent>
        
        <TabsContent value="diagnostics">
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            <PriceDebugger />
            <PriceSourceDiagnostic />
          </div>
        </TabsContent>
      </Tabs>
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


import React from 'react';
import AdminLayout from '@/components/Admin/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTokenPrice } from '@/context/TokenPriceContext';
import { useTokenData } from '@/hooks/useTokenData';
import TokenPriceChart from '@/components/Admin/TokenPricing/TokenPriceChart';
import CurrentPriceCard from '@/components/Admin/TokenPricing/CurrentPriceCard';
import ConfigurationTab from '@/components/Admin/TokenPricing/ConfigurationTab';
import DiagnosticsTab from '@/components/Admin/TokenPricing/DiagnosticsTab';

const TokenPricingPage = () => {
  const { 
    currentPrice, 
    isLoading: isPriceLoading, 
    refreshPrice,
    lastUpdated,
    timeUntilNextUpdate
  } = useTokenPrice();
  
  const { 
    priceData, 
    isLoading: isHistoryLoading,
    refreshAllData
  } = useTokenData();
  
  // Format the last updated time
  const formattedLastUpdated = lastUpdated 
    ? lastUpdated.toLocaleTimeString() 
    : 'Not yet updated';
    
  // Calculate time until next refresh in seconds
  const secondsUntilRefresh = Math.ceil(timeUntilNextUpdate / 1000);
    
  return (
    <AdminLayout title="Token Pricing">
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3">
        <TokenPriceChart 
          priceData={priceData} 
          isHistoryLoading={isHistoryLoading}
          refreshAllData={refreshAllData}
        />
        
        <CurrentPriceCard 
          currentPrice={currentPrice}
          isPriceLoading={isPriceLoading}
          refreshPrice={refreshPrice}
          formattedLastUpdated={formattedLastUpdated}
          secondsUntilRefresh={secondsUntilRefresh}
        />
      </div>
      
      <div className="mt-6">
        <Tabs defaultValue="configuration" className="w-full">
          <TabsList>
            <TabsTrigger value="configuration">Configuration</TabsTrigger>
            <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="configuration" className="mt-6">
            <ConfigurationTab />
          </TabsContent>
          
          <TabsContent value="diagnostics" className="mt-6">
            <DiagnosticsTab currentPrice={currentPrice} />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default TokenPricingPage;

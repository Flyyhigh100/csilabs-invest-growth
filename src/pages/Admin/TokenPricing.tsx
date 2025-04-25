
import React from 'react';
import AdminLayout from '@/components/Admin/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TokenPriceChart from '@/components/Admin/TokenPricing/TokenPriceChart';
import CurrentPriceCard from '@/components/Admin/TokenPricing/CurrentPriceCard';
import ConfigurationTab from '@/components/Admin/TokenPricing/ConfigurationTab';
import DiagnosticsTab from '@/components/Admin/TokenPricing/DiagnosticsTab';
import { useTokenData } from '@/hooks/useTokenData';

const TokenPricingPage = () => {
  // Use our useTokenData hook instead of directly using useTokenPrice
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

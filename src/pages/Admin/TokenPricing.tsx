import React from 'react';
import AdminLayout from '@/components/Admin/Layout';
import CurrentPriceCard from '@/components/Admin/TokenPricing/CurrentPriceCard';
import { TokenPriceProvider, useTokenPrice } from '@/context/TokenPriceContext';
import { PriceDebugger } from '@/components/Admin/TokenPricing/PriceDebugger';
import PriceSourceDiagnostic from '@/components/Admin/TokenPricing/PriceSourceDiagnostic';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';

const TokenPricingContent = () => {
  const { currentPrice } = useTokenPrice();

  return (
    <div className="space-y-6">
      <Alert>
        <AlertDescription>
          The token price is currently locked at <strong>$1.00 USD per coin</strong>. The
          live price chart and on-chain refresh have been disabled. Diagnostics remain
          available below.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            <CurrentPriceCard currentPrice={currentPrice} />
            <PriceDebugger />
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

const TokenPricingPage = () => (
  <AdminLayout title="Token Pricing">
    <TokenPriceProvider>
      <TokenPricingContent />
    </TokenPriceProvider>
  </AdminLayout>
);

export default TokenPricingPage;

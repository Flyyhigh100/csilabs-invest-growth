import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RealTimePriceDisplay from './RealTimePriceDisplay';
import GraphProtocolChart from './GraphProtocolChart';
import DataIntegrityNotice from './DataIntegrityNotice';

const EnhancedTokenChart = () => {
  return (
    <div className="space-y-6">
      <DataIntegrityNotice />
      
      <Tabs defaultValue="current" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="current">Real-Time Price</TabsTrigger>
          <TabsTrigger value="historical">Historical Data</TabsTrigger>
        </TabsList>
        
        <TabsContent value="current" className="space-y-4">
          <RealTimePriceDisplay />
        </TabsContent>

        <TabsContent value="historical" className="space-y-4">
          <GraphProtocolChart />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedTokenChart;
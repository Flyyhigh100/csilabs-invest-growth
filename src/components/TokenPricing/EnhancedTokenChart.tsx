import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RealTimePriceDisplay from './RealTimePriceDisplay';
import MultiSourceChartWidget from './MultiSourceChartWidget';
import DataIntegrityNotice from './DataIntegrityNotice';

const EnhancedTokenChart = () => {
  return (
    <div className="space-y-6">
      <DataIntegrityNotice />
      
      <Tabs defaultValue="current" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="current">Real-Time Price</TabsTrigger>
          <TabsTrigger value="chart">Live Chart</TabsTrigger>
        </TabsList>
        
        <TabsContent value="current" className="space-y-4">
          <RealTimePriceDisplay />
        </TabsContent>

        <TabsContent value="chart" className="space-y-4">
          <MultiSourceChartWidget 
            poolAddress="0xb85372c56884a906ab33c0e99fea572c7c6ad7eb"
            symbol="POLYGON:CSLUSDC"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedTokenChart;
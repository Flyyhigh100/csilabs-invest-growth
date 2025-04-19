
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SystemFlowChart from './SystemFlowChart';

const SystemFlowCard = () => {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>System Flow Visualization</CardTitle>
      </CardHeader>
      <CardContent className="h-[600px]">
        <SystemFlowChart />
      </CardContent>
    </Card>
  );
};

export default SystemFlowCard;

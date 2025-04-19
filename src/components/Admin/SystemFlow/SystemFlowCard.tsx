
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import SystemFlowChart from './SystemFlowChart';

const SystemFlowCard = () => {
  return (
    <div className="space-y-4">
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>System Flow Visualization</CardTitle>
        </CardHeader>
        <CardContent className="h-[600px]">
          <SystemFlowChart />
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-primary bg-background"></div>
              <span>Start/End Points</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-warning bg-background"></div>
              <span>Decision Points</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-destructive bg-background"></div>
              <span>Admin Actions</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-success bg-background"></div>
              <span>Success States</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 bg-background"></div>
              <span>User Actions</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemFlowCard;

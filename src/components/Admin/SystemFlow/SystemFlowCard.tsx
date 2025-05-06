
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
        <CardContent className="h-[700px]">
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
              <div className="w-4 h-4 border-2 border-info bg-background"></div>
              <span>Notifications</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 bg-background"></div>
              <span>User/System Actions</span>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Process Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This diagram illustrates the complete token purchase flow from initial user visit through wallet setup, 
            payment selection, KYC verification (for purchases over $10,000), payment processing, and admin token distribution.
            The system includes multiple payment methods, a comprehensive KYC review process with clarification requests, 
            and automated notifications at key points in the user journey.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemFlowCard;

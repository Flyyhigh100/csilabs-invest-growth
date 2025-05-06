
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
            This diagram illustrates the two primary paths for acquiring CSI tokens:
          </p>
          <ul className="text-sm text-muted-foreground mt-2 space-y-2 list-disc pl-4">
            <li><strong>Initial Wallet Setup:</strong> All users begin by configuring their wallet address. If they don't already have cryptocurrency in their wallet, they can fund it using Stripe Crypto Onramp.</li>
            <li><strong>Direct Purchase Path:</strong> Users can purchase tokens directly through CoinPayments, with KYC verification required for purchases over $10,000. This path includes admin review for KYC and manual token distribution.</li>
            <li><strong>DEX Purchase Path:</strong> After funding their wallet (if needed), users can acquire tokens via a decentralized exchange.</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-2">
            Both acquisition paths include automated notifications at key points in the user journey. The system supports comprehensive KYC review with clarification requests for the direct purchase path.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemFlowCard;

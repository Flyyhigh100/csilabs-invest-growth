
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wrench, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ToolsTabProps {
  onGoToTransactionTools: () => void;
}

const ToolsTab: React.FC<ToolsTabProps> = ({
  onGoToTransactionTools,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction Tools</CardTitle>
        <CardDescription>
          Access tools for managing and troubleshooting transactions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Transaction Management</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-3">
              Tools to help manage and troubleshoot transaction processes
            </p>
            <div className="flex gap-2 items-center">
              <Button onClick={onGoToTransactionTools}>
                <Wrench className="h-4 w-4 mr-2" />
                Open Transaction Tools
              </Button>
              <Badge variant="outline" className="border-amber-500 text-amber-700 bg-amber-50">
                Admin Only
              </Badge>
            </div>
          </div>

          <div className="pt-4 border-t">
            <h3 className="text-lg font-medium">Crypto Payment Status Monitoring</h3>
            <p className="text-sm text-muted-foreground mt-1 mb-3">
              Advanced tools for monitoring and debugging crypto payment transactions
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button 
                variant="outline" 
                onClick={onGoToTransactionTools} 
                className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100"
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                Check Transaction Status
              </Button>
            </div>
            
            <div className="mt-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-800">
              <p className="font-medium">API Keys Required</p>
              <p>To use all transaction debugging features, ensure API keys are properly configured in API Settings.</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ToolsTab;

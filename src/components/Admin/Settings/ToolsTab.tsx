
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

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
            <Button onClick={onGoToTransactionTools}>
              Open Transaction Tools
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ToolsTab;

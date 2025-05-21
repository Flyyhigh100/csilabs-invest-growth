
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import SyncAllTransactionsButton from '@/components/Admin/SyncAllTransactionsButton';

interface SyncAllTransactionsBarProps {
  onSyncComplete?: () => void;
}

const SyncAllTransactionsBar: React.FC<SyncAllTransactionsBarProps> = ({ 
  onSyncComplete 
}) => {
  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex-grow">
            <h3 className="font-semibold text-blue-800">Sync Transaction Status</h3>
            <p className="text-sm text-blue-700">
              Update pending transaction status from payment providers
            </p>
          </div>
          <div className="flex space-x-2">
            <SyncAllTransactionsButton 
              onSyncComplete={onSyncComplete} 
              variant="outline"
            />
            <SyncAllTransactionsButton 
              onSyncComplete={onSyncComplete}
              forceUpdate={true}
              variant="default"
            />
          </div>
        </div>
        
        <Alert variant="warning" className="bg-amber-50 border-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-xs text-amber-700">
            Use "Force Update All" when transactions appear stuck or CoinPayments status is out of sync.
            This will bypass cached statuses and perform direct API calls.
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default SyncAllTransactionsBar;

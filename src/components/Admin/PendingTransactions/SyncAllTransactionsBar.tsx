
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCcw } from 'lucide-react';
import SyncAllTransactionsButton from '@/components/Admin/SyncAllTransactionsButton';

interface SyncAllTransactionsBarProps {
  onSyncComplete: () => void;
}

const SyncAllTransactionsBar: React.FC<SyncAllTransactionsBarProps> = ({ onSyncComplete }) => {
  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center">
            <RefreshCcw className="mr-2 h-5 w-5 text-primary" />
            <div>
              <h3 className="text-sm font-medium">Transaction Synchronization</h3>
              <p className="text-xs text-muted-foreground">Sync all pending transactions with CoinPayments</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <SyncAllTransactionsButton 
              onSyncComplete={onSyncComplete} 
              variant="default"
              size="sm"
            />
            
            <SyncAllTransactionsButton 
              onSyncComplete={onSyncComplete}
              variant="outline"
              size="sm"
              forceUpdate={true}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SyncAllTransactionsBar;

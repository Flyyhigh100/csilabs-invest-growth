
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface StatusSyncCardProps {
  onSync: () => void;
}

const StatusSyncCard: React.FC<StatusSyncCardProps> = ({ onSync }) => {
  const [isSyncing, setIsSyncing] = useState(false);
  
  const handleSync = () => {
    setIsSyncing(true);
    
    try {
      onSync();
    } finally {
      // Add a small delay to show the loading state
      setTimeout(() => {
        setIsSyncing(false);
      }, 1000);
    }
  };
  
  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardContent className="pt-6">
        <div className="flex flex-col space-y-4">
          <div>
            <h3 className="font-semibold text-blue-900">Refresh Transaction Data</h3>
            <p className="text-sm text-blue-700">
              Reload transaction data from the database with the current filter settings
            </p>
          </div>
          
          <Button
            onClick={handleSync}
            disabled={isSyncing}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
            {isSyncing ? 'Refreshing Data...' : 'Refresh Data'}
          </Button>
          
          <div className="text-xs text-blue-700">
            This will reload transaction data based on your current filter settings.
            Use this after updating transaction statuses to see the changes.
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusSyncCard;

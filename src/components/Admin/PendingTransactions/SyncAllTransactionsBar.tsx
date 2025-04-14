
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SyncAllTransactionsBarProps {
  onSyncComplete: () => void;
}

const SyncAllTransactionsBar: React.FC<SyncAllTransactionsBarProps> = ({ onSyncComplete }) => {
  const [isSyncing, setIsSyncing] = React.useState(false);

  const handleRefresh = async () => {
    try {
      setIsSyncing(true);
      
      const toastId = toast.loading('Refreshing transaction data...');
      
      const { error } = await supabase.functions.invoke('admin-sync-all-transactions', {
        body: { forceUpdate: false, storeExternalIds: true }
      });
      
      toast.dismiss(toastId);
      
      if (error) {
        console.error('Error syncing transactions:', error);
        toast.error('Failed to refresh transactions');
        return;
      }
      
      toast.success('Transaction data refreshed');
      onSyncComplete();
    } catch (err) {
      console.error('Exception syncing transactions:', err);
      toast.error('Failed to refresh transactions');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex justify-end mb-4">
      <Button 
        variant="outline"
        size="sm"
        disabled={isSyncing}
        onClick={handleRefresh}
        className="flex items-center gap-1"
      >
        <RefreshCw className={`h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
        {isSyncing ? 'Refreshing...' : 'Refresh'}
      </Button>
    </div>
  );
};

export default SyncAllTransactionsBar;

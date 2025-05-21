
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SyncAllTransactionsButtonProps {
  onSyncComplete?: () => void;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  forceUpdate?: boolean;
}

const SyncAllTransactionsButton: React.FC<SyncAllTransactionsButtonProps> = ({ 
  onSyncComplete, 
  variant = "default",
  size = "default",
  forceUpdate = false
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [results, setResults] = useState<any>(null);

  const handleSyncAll = async () => {
    try {
      setIsSyncing(true);
      
      // Show toast to indicate sync has started
      const toastId = toast.loading(
        forceUpdate ? 'Force updating all transactions...' : 'Syncing all pending transactions...'
      );
      
      // Call the edge function
      const { data, error } = await supabase.functions.invoke('admin-sync-all-transactions', {
        body: { forceUpdate, storeExternalIds: true }
      });
      
      // Clear the loading toast
      toast.dismiss(toastId);
      
      if (error) {
        console.error('Error syncing transactions:', error);
        toast.error('Failed to sync transactions', {
          description: 'Unable to synchronize transaction statuses. Please try again later.'
        });
        return;
      }
      
      console.log('Sync results:', data);
      setResults(data);
      
      // Show success or partial success message
      if (data.failureCount === 0 && data.successCount > 0) {
        toast.success(`Successfully synced ${data.successCount} transactions`, {
          description: 'All transactions were updated with the latest status from CoinPayments'
        });
      } else if (data.successCount > 0) {
        toast.warning(`Synced with some issues`, {
          description: `${data.successCount} succeeded, ${data.failureCount} failed`
        });
      } else if (data.totalProcessed === 0) {
        toast.info('No pending transactions found to sync');
      } else {
        toast.error(`Failed to sync ${data.failureCount} transactions`, {
          description: 'No transactions were updated successfully'
        });
      }
      
      // Call the callback if provided
      if (onSyncComplete) {
        onSyncComplete();
      }
    } catch (err) {
      console.error('Exception syncing transactions:', err);
      toast.error('Failed to sync transactions', {
        description: (err as Error).message || 'An unexpected error occurred'
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      disabled={isSyncing}
      onClick={handleSyncAll}
    >
      <RefreshCcw className={`mr-2 h-4 w-4 ${isSyncing ? 'animate-spin' : ''}`} />
      {forceUpdate ? 'Force Update All' : 'Sync All Transactions'}
    </Button>
  );
};

export default SyncAllTransactionsButton;

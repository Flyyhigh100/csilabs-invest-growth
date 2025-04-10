
import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Transaction } from '@/types/transactions';
import { useStripeSync } from '@/hooks/admin/useStripeSync';

interface SyncStripePaymentButtonProps {
  transaction: Transaction;
  onSyncComplete?: (updatedTransaction: Transaction | null) => void;
  size?: 'default' | 'sm' | 'lg' | 'icon'; // Add size prop to match the expected type
}

const SyncWithStripeButton = ({ 
  transaction, 
  onSyncComplete,
  size = 'sm' // Default to 'sm' if not provided
}: SyncStripePaymentButtonProps) => {
  const { syncTransaction, isSyncing } = useStripeSync();
  
  // Only show for stripe transactions in pending status
  if (transaction.payment_method !== 'stripe' || transaction.status !== 'pending') {
    return null;
  }

  const handleSync = async () => {
    const updatedTransaction = await syncTransaction(transaction);
    if (onSyncComplete && updatedTransaction) {
      onSyncComplete(updatedTransaction);
    }
  };

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={handleSync}
      disabled={isSyncing}
    >
      <RefreshCw className={`h-3 w-3 mr-1 ${isSyncing ? 'animate-spin' : ''}`} />
      {isSyncing ? 'Syncing...' : 'Sync with Stripe'}
    </Button>
  );
};

export default SyncWithStripeButton;

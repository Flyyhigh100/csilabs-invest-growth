
import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Transaction } from '@/types/transactions';
import { useStripeFallbackCheck } from '@/hooks/payments/useStripeFallbackCheck';

interface SyncStripePaymentButtonProps {
  transaction: Transaction;
  onSyncComplete?: (updatedTransaction: Transaction | null) => void;
}

const SyncStripePaymentButton = ({ 
  transaction, 
  onSyncComplete 
}: SyncStripePaymentButtonProps) => {
  const { verifyPendingPayment, isVerifying } = useStripeFallbackCheck();
  
  // Only show for stripe transactions in pending status
  if (transaction.payment_method !== 'stripe' || 
      transaction.status !== 'pending' || 
      !transaction.external_transaction_id) {
    return null;
  }

  const handleVerify = async () => {
    const updatedTransaction = await verifyPendingPayment(transaction);
    if (onSyncComplete && updatedTransaction) {
      onSyncComplete(updatedTransaction);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleVerify}
      disabled={isVerifying}
      className="text-xs"
    >
      <RefreshCw className={`h-3 w-3 mr-1 ${isVerifying ? 'animate-spin' : ''}`} />
      {isVerifying ? 'Checking...' : 'Verify Payment'}
    </Button>
  );
};

export default SyncStripePaymentButton;

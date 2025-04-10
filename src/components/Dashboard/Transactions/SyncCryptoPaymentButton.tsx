
import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Transaction } from '@/types/transactions';
import { useCryptoStatusCheck } from '@/hooks/payments/useCryptoStatusCheck';

interface SyncCryptoPaymentButtonProps {
  transaction: Transaction;
  onSyncComplete?: (updatedTransaction: Transaction | null) => void;
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const SyncCryptoPaymentButton = ({ 
  transaction, 
  onSyncComplete,
  size = 'sm' 
}: SyncCryptoPaymentButtonProps) => {
  const { checkTransactionStatus, isChecking } = useCryptoStatusCheck();
  
  // Only show for pending coinpayments transactions
  if (transaction.payment_method !== 'coinpayments' || transaction.status !== 'pending') {
    return null;
  }

  const handleSync = async () => {
    const updatedTransaction = await checkTransactionStatus(transaction);
    if (onSyncComplete && updatedTransaction) {
      onSyncComplete(updatedTransaction);
    }
  };

  return (
    <Button
      variant="ghost"
      size={size}
      onClick={handleSync}
      disabled={isChecking}
    >
      <RefreshCw className={`h-3 w-3 mr-1 ${isChecking ? 'animate-spin' : ''}`} />
      {isChecking ? 'Checking...' : 'Check Status'}
    </Button>
  );
};

export default SyncCryptoPaymentButton;

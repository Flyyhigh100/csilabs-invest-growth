
import React, { useEffect, useState } from 'react';
import { Transaction } from '@/types/transactions';
import { useCryptoStatusCheck } from '@/hooks/payments/crypto';
import SyncCryptoPaymentButton from './SyncCryptoPaymentButton';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { usePolling } from '@/hooks/usePolling';

interface TransactionStatusCheckerProps {
  transaction: Transaction;
  onTransactionUpdated?: (transaction: Transaction | null) => void;
}

const TransactionStatusChecker: React.FC<TransactionStatusCheckerProps> = ({ 
  transaction,
  onTransactionUpdated 
}) => {
  const [error, setError] = useState<string | null>(null);
  const { checkTransactionStatus, isChecking } = useCryptoStatusCheck();
  
  // Poll status every 60 seconds for pending transactions
  const { startPolling, stopPolling } = usePolling(async () => {
    console.log(`Polling status for transaction ${transaction.id}`);
    try {
      const updatedTransaction = await checkTransactionStatus(transaction);
      if (updatedTransaction) {
        console.log(`Transaction ${transaction.id} status updated:`, updatedTransaction.status);
        if (onTransactionUpdated) {
          onTransactionUpdated(updatedTransaction);
        }
        
        // Stop polling if transaction is no longer pending
        if (updatedTransaction.status !== 'pending') {
          console.log(`Stopping polling for transaction ${transaction.id} - status: ${updatedTransaction.status}`);
          stopPolling();
        }
      }
    } catch (err) {
      console.error(`Error checking transaction ${transaction.id} status:`, err);
      setError('Failed to check transaction status');
    }
  }, 60000); // Check every minute

  // Start polling when component mounts if transaction is pending
  useEffect(() => {
    if (transaction.status === 'pending' && transaction.payment_method === 'coinpayments') {
      console.log(`Starting status polling for pending transaction ${transaction.id}`);
      startPolling();
    }
    
    return () => {
      console.log(`Cleaning up status checker for transaction ${transaction.id}`);
      stopPolling();
    };
  }, [transaction.id, transaction.status, startPolling, stopPolling]);

  // Don't show anything for non-crypto transactions
  if (transaction.payment_method !== 'coinpayments') {
    return null;
  }

  return (
    <div className="space-y-2">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <SyncCryptoPaymentButton
        transaction={transaction}
        onSyncComplete={onTransactionUpdated}
        className="w-full"
      />
    </div>
  );
};

export default TransactionStatusChecker;

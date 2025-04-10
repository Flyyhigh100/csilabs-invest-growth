
import React, { useState } from 'react';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { markTokensAsSent } from '@/utils/admin';
import { usePendingTransactions, PendingTransactionWithProfile } from '@/hooks/admin/usePendingTransactions';
import LoadingState from './PendingTransactions/LoadingState';
import ErrorState from './PendingTransactions/ErrorState';
import EmptyState from './PendingTransactions/EmptyState';
import TransactionsTable from './PendingTransactions/TransactionsTable';
import TransactionDialog from './PendingTransactions/TransactionDialog';

const PendingTransactions = () => {
  const [selectedTx, setSelectedTx] = useState<PendingTransactionWithProfile | null>(null);
  const [blockchainTxId, setBlockchainTxId] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { data: transactions, isLoading, error, refetch } = usePendingTransactions();

  const openDialog = (tx: PendingTransactionWithProfile) => {
    setSelectedTx(tx);
    setBlockchainTxId('');
    setIsDialogOpen(true);
  };

  const handleConfirmSent = async () => {
    if (!blockchainTxId.trim()) {
      toast.error('Please enter a blockchain transaction ID');
      return;
    }

    try {
      setIsSubmitting(true);
      await markTokensAsSent(selectedTx!.id, blockchainTxId);
      setIsDialogOpen(false);
      refetch();
      toast.success('Transaction marked as sent');
    } catch (err) {
      console.error('Error marking transaction as sent:', err);
      toast.error('Failed to update transaction status');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add some debugging for the error condition
  if (error) {
    console.error('Error in PendingTransactions component:', error);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pending Token Distributions</CardTitle>
          <CardDescription>
            Send tokens to user wallets and mark transactions as completed
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <LoadingState />
          ) : error ? (
            <ErrorState error={error as Error} refetch={refetch} />
          ) : !transactions || transactions.length === 0 ? (
            <EmptyState />
          ) : (
            <TransactionsTable 
              transactions={transactions} 
              onMarkAsSent={openDialog} 
            />
          )}
        </CardContent>
      </Card>

      <TransactionDialog 
        isOpen={isDialogOpen}
        setIsOpen={setIsDialogOpen}
        selectedTx={selectedTx}
        blockchainTxId={blockchainTxId}
        setBlockchainTxId={setBlockchainTxId}
        onConfirm={handleConfirmSent}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default PendingTransactions;

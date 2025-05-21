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
import DownloadCSVButton from './PendingTransactions/DownloadCSVButton';
import DistributionGuide from './PendingTransactions/DistributionGuide';
import DistributionStats from './PendingTransactions/DistributionStats';
import BulkActionsBar from './PendingTransactions/BulkActionsBar';
import SyncAllTransactionsBar from './PendingTransactions/SyncAllTransactionsBar';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';

const PendingTransactions = () => {
  const [selectedTx, setSelectedTx] = useState<PendingTransactionWithProfile | null>(null);
  const [blockchainTxId, setBlockchainTxId] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTransactions, setSelectedTransactions] = useState<PendingTransactionWithProfile[]>([]);

  const { 
    data: transactions, 
    isLoading, 
    error, 
    refetch, 
    includeTestData, 
    setIncludeTestData 
  } = usePendingTransactions();

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

  // Handle bulk action to mark multiple transactions as sent
  const handleBulkMarkAsSent = async (transactionIds: string[], blockchainTxId: string) => {
    if (!blockchainTxId.trim()) {
      toast.error('Please enter a blockchain transaction ID');
      return;
    }

    try {
      setIsSubmitting(true);
      // Process each transaction in sequence
      for (const txId of transactionIds) {
        await markTokensAsSent(txId, blockchainTxId);
      }
      
      refetch();
      setSelectedTransactions([]); // Clear selections after successful update
      toast.success(`${transactionIds.length} transactions marked as sent`);
    } catch (err) {
      console.error('Error marking transactions as sent:', err);
      toast.error('Failed to update transaction status');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle transaction updates from sync operation
  const handleTransactionUpdated = () => {
    refetch();
  };

  // Handle selection of a transaction
  const handleSelectTransaction = (tx: PendingTransactionWithProfile, isSelected: boolean) => {
    if (isSelected) {
      setSelectedTransactions(prev => [...prev, tx]);
    } else {
      setSelectedTransactions(prev => prev.filter(item => item.id !== tx.id));
    }
  };

  // Handle select all transactions
  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected && transactions) {
      setSelectedTransactions([...transactions]);
    } else {
      setSelectedTransactions([]);
    }
  };

  // Add some debugging for the error condition
  if (error) {
    console.error('Error in PendingTransactions component:', error);
  }

  return (
    <div className="space-y-6">
      {/* Distribution Guide - Collapsible help section */}
      <DistributionGuide />
      
      {/* Sync All Transactions Bar */}
      <SyncAllTransactionsBar onSyncComplete={refetch} />
      
      {/* Test Data Toggle */}
      <div className="flex items-center justify-end space-x-2">
        <Label htmlFor="include-test-data" className="text-sm font-medium">
          Include test data
        </Label>
        <Switch 
          id="include-test-data" 
          checked={includeTestData} 
          onCheckedChange={setIncludeTestData}
        />
      </div>
      
      {/* Main Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Pending Token Distributions</CardTitle>
            <CardDescription>
              Send tokens to user wallets and mark transactions as completed
            </CardDescription>
          </div>
          <div className="flex items-center space-x-4">
            {includeTestData && (
              <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Showing Test Data
              </Badge>
            )}
            {transactions && transactions.length > 0 && (
              <DownloadCSVButton transactions={transactions} />
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Distribution Statistics */}
          {transactions && transactions.length > 0 && (
            <DistributionStats transactions={transactions} />
          )}
          
          {/* Bulk Actions Bar */}
          <BulkActionsBar 
            selectedTransactions={selectedTransactions}
            onMarkAsSent={handleBulkMarkAsSent}
            disabled={isSubmitting}
          />
          
          {/* Transactions Table */}
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
              onTransactionUpdated={handleTransactionUpdated}
              selectedTransactions={selectedTransactions}
              onSelectTransaction={handleSelectTransaction}
              onSelectAll={handleSelectAll}
              includeTestData={includeTestData}
            />
          )}
        </CardContent>
      </Card>

      {/* Transaction Dialog */}
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

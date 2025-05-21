
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTransactions } from '@/hooks/transactions/useTransactions';
import TransactionsTable from './Transactions/TransactionsTable';
import TransactionDetails from './Transactions/TransactionDetails';
import LoadingState from './Transactions/LoadingState';
import ErrorState from './Transactions/ErrorState';
import EmptyState from './Transactions/EmptyState';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { Transaction } from '@/types/transactions';
import RefreshCryptoTransactionsButton from './Transactions/RefreshCryptoTransactionsButton';
import { TooltipProvider } from '@/components/ui/tooltip';

const TransactionsList = () => {
  const { user } = useAuth();
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  
  const { 
    transactions,
    isLoading,
    error,
    refetch,
    isFetching
  } = useTransactions(user?.id);
  
  const handleRefresh = () => {
    refetch();
  };
  
  // Handle transaction sync completion
  const handleSyncComplete = (updatedTransaction: Transaction | null) => {
    if (updatedTransaction) {
      refetch();
    }
  };

  // Check if there are any pending crypto transactions
  const hasPendingCrypto = transactions?.some(
    tx => tx.payment_method === 'coinpayments' && (tx.status === 'pending' || tx.status === 'confirmed')
  );
  
  // Check if there are any crypto transactions regardless of status
  const hasCryptoTransactions = transactions?.some(
    tx => tx.payment_method === 'coinpayments'
  );
  
  if (isLoading) {
    return <LoadingState />;
  }
  
  if (error) {
    return <ErrorState error={error as Error} refetch={refetch} />;
  }
  
  if (!transactions || transactions.length === 0) {
    return <EmptyState />;
  }
  
  return (
    <TooltipProvider>
      <div className="space-y-4">
        <TransactionsTable 
          transactions={transactions} 
          expandedItem={expandedItem}
          setExpandedItem={setExpandedItem}
          onSyncComplete={handleSyncComplete}
        />

        {/* Expanded Transaction Details */}
        {expandedItem && transactions.map(tx => {
          if (tx.id !== expandedItem) return null;
          return (
            <TransactionDetails 
              key={`detail-${tx.id}`} 
              transaction={tx} 
              onRefresh={handleRefresh}
            />
          );
        })}

        <div className="text-center text-xs text-gray-500 mt-4">
          <p>For transaction support, please contact support@csiworld.io</p>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default TransactionsList;

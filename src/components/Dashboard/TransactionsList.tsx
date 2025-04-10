
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

const TransactionsList = () => {
  const { user } = useAuth();
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  
  const { 
    data: transactions,
    isLoading,
    error,
    refetch,
    isFetching
  } = useTransactions(user?.id);
  
  const handleRefresh = () => {
    refetch();
  };
  
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
    <div className="space-y-4">
      <div className="flex justify-end mb-2">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleRefresh}
          disabled={isFetching}
          className="text-xs"
        >
          <RefreshCw className={`h-3 w-3 mr-1 ${isFetching ? 'animate-spin' : ''}`} />
          {isFetching ? 'Refreshing...' : 'Refresh'}
        </Button>
      </div>
      
      <TransactionsTable 
        transactions={transactions} 
        expandedItem={expandedItem}
        setExpandedItem={setExpandedItem}
      />

      {/* Expanded Transaction Details */}
      {expandedItem && transactions.map(tx => {
        if (tx.id !== expandedItem) return null;
        return <TransactionDetails key={`detail-${tx.id}`} transaction={tx} />;
      })}

      <div className="text-center text-xs text-gray-500 mt-4">
        <p>For transaction support, please contact support@csiworld.io</p>
      </div>
    </div>
  );
};

export default TransactionsList;

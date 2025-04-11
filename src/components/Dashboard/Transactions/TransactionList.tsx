
import React from 'react';
import { Transaction } from '@/types/transactions';
import TransactionsTable from './TransactionsTable';
import { useTransactions } from '@/hooks/transactions/useTransactions';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface TransactionListProps {
  transactions: Transaction[];
  isAdminView?: boolean;
  onTransactionUpdated?: () => void;
}

const TransactionList = ({ 
  transactions, 
  isAdminView = false,
  onTransactionUpdated 
}: TransactionListProps) => {
  const [expandedItem, setExpandedItem] = React.useState<string | null>(null);
  
  const handleSyncComplete = (updatedTransaction: Transaction | null) => {
    if (onTransactionUpdated) {
      onTransactionUpdated();
    }
  };

  return (
    <TransactionsTable 
      transactions={transactions}
      expandedItem={expandedItem}
      setExpandedItem={setExpandedItem}
      onSyncComplete={handleSyncComplete}
      isAdminView={isAdminView}
    />
  );
};

export default TransactionList;

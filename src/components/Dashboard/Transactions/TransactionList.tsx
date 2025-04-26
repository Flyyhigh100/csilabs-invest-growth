
import React from 'react';
import { Transaction } from '@/types/transactions';
import TransactionItem from './TransactionItem';
import TransactionStatusChecker from './TransactionStatusChecker';

interface TransactionListProps {
  transactions: Transaction[];
  onTransactionUpdated?: (transaction: Transaction | null) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ 
  transactions,
  onTransactionUpdated 
}) => {
  return (
    <div className="space-y-4">
      {transactions.map((transaction) => (
        <div key={transaction.id} className="space-y-2">
          <TransactionItem transaction={transaction} />
          <TransactionStatusChecker
            transaction={transaction}
            onTransactionUpdated={onTransactionUpdated}
          />
        </div>
      ))}
    </div>
  );
};

export default TransactionList;

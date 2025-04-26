
import React from 'react';
import { Transaction } from '@/types/transactions';
import { formatCurrency } from '@/utils/format'; // Updated import path
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface TransactionItemProps {
  transaction: Transaction;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction }) => {
  // Determine badge color based on transaction status
  const getStatusBadgeVariant = () => {
    switch (transaction.status) {
      case 'pending':
        return 'warning';
      case 'completed':
        return 'success';
      case 'failed':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="flex justify-between items-center p-4 bg-white rounded-lg shadow-sm border">
      <div className="flex-grow">
        <div className="font-medium">
          {transaction.payment_method.toUpperCase()} Transaction
        </div>
        <div className="text-sm text-gray-500">
          {formatCurrency(transaction.amount)}
        </div>
      </div>
      <Badge 
        variant={getStatusBadgeVariant()} 
        className="capitalize"
      >
        {transaction.status}
      </Badge>
    </div>
  );
};

export default TransactionItem;

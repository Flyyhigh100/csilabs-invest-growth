
import React from 'react';
import { Transaction } from '@/types/transactions';
import { formatCurrency } from '@/utils/format';
import { formatDateWithTime } from '@/utils/date';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Clock, Coins, DollarSign } from 'lucide-react';

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

  // Get token amount (if available) or calculate it based on price
  const tokenAmount = transaction.token_amount || 
    (transaction.token_price && transaction.token_price > 0 ? 
      transaction.amount / transaction.token_price : null);

  return (
    <div className="flex justify-between items-start p-4 bg-white rounded-lg shadow-sm border hover:border-cbis-blue/20 hover:shadow transition-all">
      <div className="flex-grow">
        <div className="font-medium">
          {transaction.payment_method.toUpperCase()} Transaction
        </div>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 mt-1">
          <div className="flex items-center text-sm text-gray-700">
            <DollarSign className="h-3 w-3 mr-1 text-gray-500" />
            <span>{formatCurrency(transaction.amount)}</span>
          </div>
          
          {tokenAmount && (
            <div className="flex items-center font-medium text-cbis-blue text-sm">
              <Coins className="h-3 w-3 mr-1" />
              {tokenAmount.toFixed(2)} CSL
            </div>
          )}
        </div>
        
        <div className="text-xs text-gray-400 flex items-center mt-1">
          <Clock className="h-3 w-3 mr-1" />
          {formatDateWithTime(transaction.created_at)}
        </div>
      </div>
      
      <div className="flex flex-col items-end gap-2">
        <Badge 
          variant={getStatusBadgeVariant()} 
          className="capitalize"
        >
          {transaction.status}
        </Badge>
        
        {transaction.token_price && (
          <div className="text-xs text-gray-500">
            Price: ${transaction.token_price.toFixed(4)}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionItem;

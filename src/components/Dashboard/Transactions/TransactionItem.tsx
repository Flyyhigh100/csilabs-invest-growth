
import React from 'react';
import { Transaction } from '@/types/transactions';
import { formatCurrency } from '@/utils/format';
import { formatDateWithTime } from '@/utils/date';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Clock, Coins, DollarSign, ExternalLink } from 'lucide-react';
import StatusBadge from './StatusBadge';

interface TransactionItemProps {
  transaction: Transaction;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction }) => {
  // Get token amount (if available) or calculate it based on price
  const tokenAmount = transaction.token_amount || 
    (transaction.token_price && transaction.token_price > 0 ? 
      transaction.amount / transaction.token_price : null);

  // Generate blockchain explorer link if available
  const getBlockchainExplorerUrl = (txId: string) => {
    // Check if it's a Solana transaction
    const isSolana = txId.startsWith('sol:') || 
                    transaction.payment_method?.toLowerCase().includes('solana');
    
    // Remove any blockchain prefix if present
    const cleanTxId = txId.startsWith('sol:') ? txId.substring(4) : txId;
    
    // Return the appropriate blockchain explorer URL
    if (isSolana) {
      return `https://solscan.io/tx/${cleanTxId}`;
    } else {
      return `https://polygonscan.com/tx/${cleanTxId}`;
    }
  };

  // Get explorer name based on transaction type
  const getExplorerName = (txId: string) => {
    const isSolana = txId.startsWith('sol:') || 
                    transaction.payment_method?.toLowerCase().includes('solana');
    return isSolana ? 'Solscan' : 'PolygonScan';
  };

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
              {tokenAmount.toFixed(2)} CSI
            </div>
          )}
        </div>
        
        <div className="text-xs text-gray-400 flex items-center mt-1">
          <Clock className="h-3 w-3 mr-1" />
          {formatDateWithTime(transaction.created_at)}
        </div>
        
        {transaction.blockchain_tx_id && (
          <div className="mt-2 text-xs">
            <a 
              href={getBlockchainExplorerUrl(transaction.blockchain_tx_id)} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline flex items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="truncate max-w-[150px]">
                {getExplorerName(transaction.blockchain_tx_id)}: {transaction.blockchain_tx_id.slice(0, 6)}...{transaction.blockchain_tx_id.slice(-4)}
              </span>
              <ExternalLink className="h-3 w-3 ml-1" />
            </a>
          </div>
        )}
      </div>
      
      <div className="flex flex-col items-end gap-2">
        <StatusBadge transaction={transaction} />
        
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


import React from 'react';
import { Transaction } from '@/types/transactions';
import { ExternalLink, CheckCircle2 } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import StatusBadge from '@/components/Dashboard/Transactions/StatusBadge';

interface TokenTransactionItemProps {
  transaction: Transaction;
}

const TokenTransactionItem: React.FC<TokenTransactionItemProps> = ({ transaction }) => {
  const getPolygonScanUrl = (txId: string) => {
    return `https://polygonscan.com/tx/${txId}`;
  };
  
  return (
    <div className="p-2 hover:bg-gray-50 flex items-center justify-between">
      <div className="flex flex-col">
        <span className="font-medium">{transaction.amount.toFixed(2)} CSI</span>
        <span className="text-xs text-gray-500">{new Date(transaction.updated_at).toLocaleDateString()}</span>
      </div>
      
      {transaction.blockchain_tx_id ? (
        <Tooltip>
          <TooltipTrigger asChild>
            <a 
              href={getPolygonScanUrl(transaction.blockchain_tx_id)} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex px-2 py-1 text-xs font-medium rounded-full border bg-green-100 text-green-800 border-green-300 hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="flex items-center">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                View on PolygonScan
                <ExternalLink className="h-2 w-2 ml-1" />
              </span>
            </a>
          </TooltipTrigger>
          <TooltipContent side="top">
            <div className="text-xs">
              <div>Transaction ID: {transaction.blockchain_tx_id.slice(0, 8)}...{transaction.blockchain_tx_id.slice(-6)}</div>
              <div className="text-muted-foreground">Click to view on PolygonScan</div>
            </div>
          </TooltipContent>
        </Tooltip>
      ) : (
        <StatusBadge status={transaction.status} tokenSent={transaction.token_sent} />
      )}
    </div>
  );
};

export default TokenTransactionItem;

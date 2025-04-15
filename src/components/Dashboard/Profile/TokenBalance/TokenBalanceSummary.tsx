
import React from 'react';
import { Coins } from 'lucide-react';

interface TokenBalanceSummaryProps {
  totalTokens: number;
  latestTransaction: Date | null;
  transactionsCount: number;
}

const TokenBalanceSummary: React.FC<TokenBalanceSummaryProps> = ({ 
  totalTokens, 
  latestTransaction, 
  transactionsCount 
}) => {
  return (
    <>
      <div className="flex items-center justify-between px-2 py-3 bg-slate-50 dark:bg-slate-800 rounded-md">
        <div className="flex items-center">
          <Coins className="h-6 w-6 mr-3 text-amber-500" />
          <span className="font-medium">Total CSI Tokens</span>
        </div>
        <span className="text-lg font-bold">{totalTokens.toFixed(2)} CSI</span>
      </div>
      
      {latestTransaction && (
        <div className="text-sm text-gray-500 flex justify-between">
          <span>Latest transfer:</span>
          <span>{latestTransaction.toLocaleDateString()}</span>
        </div>
      )}
      
      {transactionsCount > 0 && (
        <div className="text-sm text-gray-500 flex justify-between">
          <span>Transfers completed:</span>
          <span>{transactionsCount}</span>
        </div>
      )}
    </>
  );
};

export default TokenBalanceSummary;

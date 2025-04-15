
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Transaction } from '@/types/transactions';
import { ChevronDown, ChevronUp } from 'lucide-react';
import TokenTransactionItem from './TokenTransactionItem';

interface TokenTransactionListProps {
  transactions: Transaction[];
}

const TokenTransactionList: React.FC<TokenTransactionListProps> = ({ transactions }) => {
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  
  const toggleTransactionView = () => {
    setShowAllTransactions(prev => !prev);
  };
  
  return (
    <div className="mt-2">
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full flex justify-between items-center text-sm"
        onClick={toggleTransactionView}
      >
        <span>View transaction details</span>
        {showAllTransactions ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </Button>
      
      {showAllTransactions && (
        <div className="mt-3 border rounded-md divide-y">
          {transactions.map((tx) => (
            <TokenTransactionItem key={tx.id} transaction={tx} />
          ))}
        </div>
      )}
    </div>
  );
};

export default TokenTransactionList;

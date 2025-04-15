
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTransactions } from '@/hooks/transactions/useTransactions';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, AlertCircle } from 'lucide-react';
import { TooltipProvider } from "@/components/ui/tooltip";
import TokenBalanceSummary from './TokenBalance/TokenBalanceSummary';
import TokenTransactionList from './TokenBalance/TokenTransactionList';

const TokenBalanceCard: React.FC = () => {
  const { user } = useAuth();
  const { data: transactions, isLoading, error } = useTransactions(user?.id);
  
  // Calculate total tokens transferred
  const completedTransactions = transactions?.filter(tx => 
    tx.status === 'completed' && tx.token_sent === true
  ) || [];
  
  const totalTokens = completedTransactions.reduce((sum, tx) => sum + Number(tx.amount), 0);
  
  // Find the most recent transaction date
  const latestTransaction = completedTransactions.length > 0 
    ? new Date(Math.max(...completedTransactions.map(tx => new Date(tx.updated_at).getTime())))
    : null;
  
  return (
    <TooltipProvider>
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Token Balance</CardTitle>
          <CardDescription>Your CSI token information</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : error ? (
            <div className="flex items-center text-red-500 py-4">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>Could not load token information</span>
            </div>
          ) : (
            <div className="space-y-4">
              <TokenBalanceSummary 
                totalTokens={totalTokens} 
                latestTransaction={latestTransaction}
                transactionsCount={completedTransactions.length}
              />
              
              {completedTransactions.length > 0 && (
                <TokenTransactionList transactions={completedTransactions} />
              )}
              
              {completedTransactions.length === 0 && (
                <div className="text-center py-2 text-sm text-gray-500">
                  No tokens have been transferred to your wallet yet
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};

export default TokenBalanceCard;

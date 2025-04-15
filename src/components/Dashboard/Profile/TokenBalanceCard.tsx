
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTransactions } from '@/hooks/transactions/useTransactions';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/utils/format';
import { Loader2, Coins, AlertCircle } from 'lucide-react';

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
            
            {completedTransactions.length > 0 && (
              <div className="text-sm text-gray-500 flex justify-between">
                <span>Transfers completed:</span>
                <span>{completedTransactions.length}</span>
              </div>
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
  );
};

export default TokenBalanceCard;

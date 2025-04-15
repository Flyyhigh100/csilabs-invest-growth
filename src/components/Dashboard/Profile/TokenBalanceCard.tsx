
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTransactions } from '@/hooks/transactions/useTransactions';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/utils/format';
import { Loader2, Coins, AlertCircle, ExternalLink, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Transaction } from '@/types/transactions';
import StatusBadge from '@/components/Dashboard/Transactions/StatusBadge';

const TokenBalanceCard: React.FC = () => {
  const { user } = useAuth();
  const { data: transactions, isLoading, error } = useTransactions(user?.id);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  
  // Calculate total tokens transferred
  const completedTransactions = transactions?.filter(tx => 
    tx.status === 'completed' && tx.token_sent === true
  ) || [];
  
  const totalTokens = completedTransactions.reduce((sum, tx) => sum + Number(tx.amount), 0);
  
  // Find the most recent transaction date
  const latestTransaction = completedTransactions.length > 0 
    ? new Date(Math.max(...completedTransactions.map(tx => new Date(tx.updated_at).getTime())))
    : null;
    
  // Get the blockchain transaction URLs
  const toggleTransactionView = () => {
    setShowAllTransactions(prev => !prev);
  };
  
  const getPolygonScanUrl = (txId: string) => {
    return `https://polygonscan.com/tx/${txId}`;
  };
  
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
              
              {completedTransactions.length > 0 && (
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
                      {completedTransactions.map((tx) => (
                        <div key={tx.id} className="p-2 hover:bg-gray-50 flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="font-medium">{tx.amount.toFixed(2)} CSI</span>
                            <span className="text-xs text-gray-500">{new Date(tx.updated_at).toLocaleDateString()}</span>
                          </div>
                          
                          {tx.blockchain_tx_id ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <a 
                                  href={getPolygonScanUrl(tx.blockchain_tx_id)} 
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
                                  <div>Transaction ID: {tx.blockchain_tx_id.slice(0, 8)}...{tx.blockchain_tx_id.slice(-6)}</div>
                                  <div className="text-muted-foreground">Click to view on PolygonScan</div>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <StatusBadge status={tx.status} tokenSent={tx.token_sent} />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
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
    </TooltipProvider>
  );
};

export default TokenBalanceCard;

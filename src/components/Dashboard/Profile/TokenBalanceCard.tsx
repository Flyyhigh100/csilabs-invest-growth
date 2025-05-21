
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTransactions } from '@/hooks/transactions/useTransactions';
import { useAuth } from '@/contexts/AuthContext';
import { formatCurrency } from '@/utils/format';
import { Loader2, Coins, AlertCircle, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { format } from 'date-fns';

const TokenBalanceCard: React.FC = () => {
  const { user } = useAuth();
  const { transactions, isLoading, error } = useTransactions(user?.id);
  const [isOpen, setIsOpen] = useState(false);
  
  // Calculate total tokens delivered (using token_sent flag rather than status)
  const deliveredTransactions = transactions?.filter(tx => tx.token_sent === true) || [];
  
  const totalTokens = deliveredTransactions.reduce((sum, tx) => {
    // Use token amount if available, otherwise calculate from price
    const tokenAmount = tx.token_amount || 
      (tx.token_price && tx.token_price > 0 ? tx.amount / tx.token_price : 0);
    return sum + Number(tokenAmount || 0);
  }, 0);
  
  // Find the most recent transaction date
  const latestTransaction = deliveredTransactions.length > 0 
    ? new Date(Math.max(...deliveredTransactions.map(tx => new Date(tx.updated_at).getTime())))
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
                <span>Latest delivery:</span>
                <span>{latestTransaction.toLocaleDateString()}</span>
              </div>
            )}
            
            {deliveredTransactions.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm text-gray-500 flex justify-between">
                  <span>Deliveries completed:</span>
                  <span>{deliveredTransactions.length}</span>
                </div>
                
                <Collapsible
                  open={isOpen}
                  onOpenChange={setIsOpen}
                  className="w-full"
                >
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-2 text-sm rounded-md hover:bg-green-50 text-green-700 bg-green-100 border border-green-200 transition-colors">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                      <span>Tokens Delivered</span>
                    </div>
                    {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </CollapsibleTrigger>
                  
                  <CollapsibleContent className="mt-2">
                    <div className="border rounded-md overflow-hidden">
                      <div className="bg-gray-100 p-2 text-xs font-medium text-gray-700 grid grid-cols-3">
                        <div>Date</div>
                        <div>Amount</div>
                        <div>Transaction</div>
                      </div>
                      <div className="divide-y">
                        {deliveredTransactions.map(tx => {
                          // Calculate token amount consistently
                          const tokenAmount = tx.token_amount || 
                            (tx.token_price && tx.token_price > 0 ? tx.amount / tx.token_price : 0);
                            
                          return (
                            <div key={tx.id} className="p-2 text-sm grid grid-cols-3 hover:bg-gray-50">
                              <div>{format(new Date(tx.updated_at), 'MMM dd, yyyy HH:mm')}</div>
                              <div className="font-medium">{Number(tokenAmount).toFixed(2)} CSI</div>
                              <div>
                                {tx.blockchain_tx_id ? (
                                  <a 
                                    href={`https://polygonscan.com/tx/${tx.blockchain_tx_id}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center text-blue-600 hover:text-blue-800 hover:underline"
                                  >
                                    <span className="truncate max-w-[100px]">{tx.blockchain_tx_id.substring(0, 8)}...</span>
                                    <ExternalLink size={12} className="ml-1 inline" />
                                  </a>
                                ) : (
                                  <span className="text-gray-400 italic">No blockchain ID</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            )}
            
            {deliveredTransactions.length === 0 && (
              <div className="text-center py-2 text-sm text-gray-500">
                No tokens have been delivered to your wallet yet
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TokenBalanceCard;

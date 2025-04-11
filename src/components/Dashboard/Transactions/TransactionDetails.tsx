
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Copy, ExternalLink, CheckCircle2, Clock, Link } from 'lucide-react';
import { Transaction } from '@/types/transactions';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from 'sonner';
import SyncCryptoPaymentButton from './SyncCryptoPaymentButton';
import ManualSyncButton from './ManualSyncButton';

interface TransactionDetailsProps {
  transaction: Transaction;
  onRefresh?: () => void;
}

const TransactionDetails = ({ transaction, onRefresh }: TransactionDetailsProps) => {
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => toast.success('Copied to clipboard'))
      .catch(() => toast.error('Failed to copy'));
  };

  // Determine if this is potentially a stuck transaction
  const isPotentiallyStuck = transaction.payment_method === 'coinpayments' && 
    (transaction.status === 'pending' || transaction.status === 'confirmed') &&
    // If transaction is older than 30 minutes, it might be stuck
    (Date.now() - new Date(transaction.created_at).getTime() > 30 * 60 * 1000);

  return (
    <Card key={`detail-${transaction.id}`} className="border-t-0 rounded-t-none bg-gray-50">
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-500">Transaction Details</h4>
            <div className="bg-white p-3 rounded-md border">
              <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
                <span className="font-medium text-gray-500">Transaction ID:</span>
                <div className="flex items-center">
                  <span className="font-mono text-xs truncate">{transaction.transaction_id}</span>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-6 w-6 ml-1"
                    onClick={() => handleCopy(transaction.transaction_id)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                
                <span className="font-medium text-gray-500">Amount:</span>
                <span>${transaction.amount.toFixed(2)}</span>
                
                <span className="font-medium text-gray-500">Date:</span>
                <span>{new Date(transaction.created_at).toLocaleString()}</span>
                
                <span className="font-medium text-gray-500">Method:</span>
                <span className="capitalize">{transaction.payment_method}</span>
                
                {transaction.external_transaction_id && (
                  <>
                    <span className="font-medium text-gray-500">External ID:</span>
                    <div className="flex items-center">
                      <span className="font-mono text-xs truncate">{transaction.external_transaction_id}</span>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-6 w-6 ml-1"
                        onClick={() => handleCopy(transaction.external_transaction_id)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
              
              {/* Manual Sync Button for stuck transactions */}
              {isPotentiallyStuck && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-amber-600">
                      This transaction may be stuck
                    </div>
                    <ManualSyncButton 
                      transactionId={transaction.id} 
                      onSuccess={onRefresh}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-500">Delivery Details</h4>
            <div className="bg-white p-3 rounded-md border">
              <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
                <span className="font-medium text-gray-500">Status:</span>
                <span>
                  {transaction.token_sent ? (
                    <span className="text-green-600 flex items-center">
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Tokens Delivered
                    </span>
                  ) : transaction.status === 'completed' ? (
                    <span className="text-amber-600 flex items-center">
                      <Clock className="h-4 w-4 mr-1" />
                      Payment Complete, Processing Delivery
                    </span>
                  ) : transaction.status === 'confirmed' ? (
                    <span className="text-blue-600 flex items-center">
                      <CircleDollarSign className="h-4 w-4 mr-1" />
                      Payment Received, Awaiting Processing
                    </span>
                  ) : (
                    <span>{transaction.status}</span>
                  )}
                </span>
                
                <span className="font-medium text-gray-500">Wallet Address:</span>
                <div className="flex items-center">
                  <span className="font-mono text-xs truncate">{transaction.wallet_address}</span>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    className="h-6 w-6 ml-1"
                    onClick={() => handleCopy(transaction.wallet_address)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                
                {transaction.blockchain_tx_id && (
                  <>
                    <span className="font-medium text-gray-500">Blockchain TX:</span>
                    <div className="flex items-center">
                      <span className="font-mono text-xs truncate">{transaction.blockchain_tx_id}</span>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-6 w-6 ml-1"
                              onClick={() => window.open(`https://polygonscan.com/tx/${transaction.blockchain_tx_id}`, '_blank')}
                            >
                              <ExternalLink className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View on PolygonScan</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleCopy(transaction.blockchain_tx_id!)}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </>
                )}
                
                {transaction.token_sent && (
                  <>
                    <span className="font-medium text-gray-500">Delivered On:</span>
                    <span>{new Date(transaction.updated_at).toLocaleString()}</span>
                  </>
                )}
              </div>
              
              {transaction.payment_method === 'coinpayments' && !transaction.token_sent && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex justify-end">
                    <SyncCryptoPaymentButton 
                      transaction={transaction} 
                      onSyncComplete={onRefresh}
                      forceUpdate={true}
                      variant="outline"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {transaction.token_sent && transaction.blockchain_tx_id && (
          <div className="mt-4 p-3 bg-green-50 border border-green-100 rounded-md">
            <div className="flex items-center text-green-800 text-sm">
              <Link className="h-4 w-4 mr-2" />
              <span>
                Your tokens have been sent to your wallet. You can view the transaction on 
                <a 
                  href={`https://polygonscan.com/tx/${transaction.blockchain_tx_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium underline ml-1 hover:text-green-700"
                >
                  PolygonScan
                </a>.
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransactionDetails;

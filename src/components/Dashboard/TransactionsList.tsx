
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import { 
  Card, CardContent, CardDescription, 
  CardHeader, CardTitle, CardFooter
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, XCircle, Loader2, Clock, CreditCard, 
  ExternalLink, Copy, InfoIcon 
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Transaction {
  id: string;
  amount: number;
  wallet_address: string;
  status: string;
  payment_method: string;
  created_at: string;
  updated_at: string;
  transaction_id: string;
  token_sent: boolean;
  blockchain_tx_id?: string; // Added this property as optional
  external_transaction_id?: string;
}

const TransactionsList = () => {
  const { user } = useAuth();
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  
  const { data: transactions, isLoading, error, refetch } = useQuery({
    queryKey: ['transactions', user?.id],
    queryFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Transaction[]; // Add explicit type casting here
    },
    enabled: !!user?.id
  });
  
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => toast.success('Copied to clipboard'))
      .catch(() => toast.error('Failed to copy'));
  };
  
  const getStatusBadge = (transaction: Transaction) => {
    switch (transaction.status) {
      case 'completed':
        return transaction.token_sent ? (
          <Badge className="bg-green-500">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Complete
          </Badge>
        ) : (
          <Badge className="bg-amber-500">
            <Clock className="h-3 w-3 mr-1" />
            Processing
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="outline" className="border-amber-500 text-amber-700">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {transaction.status}
          </Badge>
        );
    }
  };
  
  const getPaymentMethodIcon = (method: string) => {
    switch (method.toLowerCase()) {
      case 'stripe':
        return <CreditCard className="h-4 w-4" />;
      case 'crypto':
      case 'coinpayments':
        return <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M15.5 9L8.5 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8.5 9H15.5V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>;
      default:
        return <InfoIcon className="h-4 w-4" />;
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
        <span className="ml-2 text-gray-500">Loading transaction history...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <p className="text-red-800">Failed to load transaction history: {(error as Error).message}</p>
        <Button variant="outline" className="mt-2" onClick={() => refetch()}>
          Try Again
        </Button>
      </div>
    );
  }
  
  if (!transactions || transactions.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <InfoIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-lg font-medium text-gray-900">No transactions yet</h3>
        <p className="mt-1 text-gray-500">
          When you make a purchase, your transaction history will appear here.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id}>
              <TableCell>
                {new Date(transaction.created_at).toLocaleDateString()}
                <div className="text-xs text-gray-500">
                  {new Date(transaction.created_at).toLocaleTimeString()}
                </div>
              </TableCell>
              <TableCell>
                <div className="font-medium">${transaction.amount.toFixed(2)}</div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  {getPaymentMethodIcon(transaction.payment_method)}
                  <span className="ml-2 capitalize">{transaction.payment_method}</span>
                </div>
              </TableCell>
              <TableCell>
                {getStatusBadge(transaction)}
              </TableCell>
              <TableCell className="text-right">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setExpandedItem(expandedItem === transaction.id ? null : transaction.id)}
                >
                  {expandedItem === transaction.id ? 'Hide' : 'View'}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Expanded Transaction Details */}
      {expandedItem && transactions.map(tx => {
        if (tx.id !== expandedItem) return null;
        
        return (
          <Card key={`detail-${tx.id}`} className="border-t-0 rounded-t-none bg-gray-50">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-500">Transaction Details</h4>
                  <div className="bg-white p-3 rounded-md border">
                    <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
                      <span className="font-medium text-gray-500">Transaction ID:</span>
                      <div className="flex items-center">
                        <span className="font-mono text-xs truncate">{tx.transaction_id}</span>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-6 w-6 ml-1"
                          onClick={() => handleCopy(tx.transaction_id)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <span className="font-medium text-gray-500">Amount:</span>
                      <span>${tx.amount.toFixed(2)}</span>
                      
                      <span className="font-medium text-gray-500">Date:</span>
                      <span>{new Date(tx.created_at).toLocaleString()}</span>
                      
                      <span className="font-medium text-gray-500">Method:</span>
                      <span className="capitalize">{tx.payment_method}</span>
                      
                      {tx.external_transaction_id && (
                        <>
                          <span className="font-medium text-gray-500">External ID:</span>
                          <div className="flex items-center">
                            <span className="font-mono text-xs truncate">{tx.external_transaction_id}</span>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-6 w-6 ml-1"
                              onClick={() => handleCopy(tx.external_transaction_id!)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-500">Delivery Details</h4>
                  <div className="bg-white p-3 rounded-md border">
                    <div className="grid grid-cols-[100px_1fr] gap-2 text-sm">
                      <span className="font-medium text-gray-500">Status:</span>
                      <span>
                        {tx.token_sent ? (
                          <span className="text-green-600 flex items-center">
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Tokens Delivered
                          </span>
                        ) : tx.status === 'completed' ? (
                          <span className="text-amber-600 flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            Payment Complete, Processing Delivery
                          </span>
                        ) : (
                          <span>{tx.status}</span>
                        )}
                      </span>
                      
                      <span className="font-medium text-gray-500">Wallet Address:</span>
                      <div className="flex items-center">
                        <span className="font-mono text-xs truncate">{tx.wallet_address}</span>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-6 w-6 ml-1"
                          onClick={() => handleCopy(tx.wallet_address)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      {tx.blockchain_tx_id && (
                        <>
                          <span className="font-medium text-gray-500">Blockchain TX:</span>
                          <div className="flex items-center">
                            <span className="font-mono text-xs truncate">{tx.blockchain_tx_id}</span>
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    className="h-6 w-6 ml-1"
                                    onClick={() => window.open(`https://polygonscan.com/tx/${tx.blockchain_tx_id}`, '_blank')}
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
                              onClick={() => handleCopy(tx.blockchain_tx_id!)}
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </>
                      )}
                      
                      {tx.token_sent && (
                        <>
                          <span className="font-medium text-gray-500">Delivered On:</span>
                          <span>{new Date(tx.updated_at).toLocaleString()}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}

      <div className="text-center text-xs text-gray-500 mt-4">
        <p>For transaction support, please contact support@csiworld.io</p>
      </div>
    </div>
  );
};

export default TransactionsList;

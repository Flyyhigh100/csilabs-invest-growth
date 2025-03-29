
import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, CreditCard, DollarSign, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface Transaction {
  id: string;
  amount: number;
  payment_method: string;
  status: string;
  transaction_id: string;
  created_at: string;
  wallet_address: string;
}

const TransactionsList = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchTransactions = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user]);

  // Fetch transactions on component mount
  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Check status of pending crypto transactions
  useEffect(() => {
    if (!transactions.length) return;
    
    // Only check crypto transactions that are pending
    const pendingCryptoTransactions = transactions.filter(
      tx => tx.status === 'pending' && (tx.payment_method === 'crypto' || tx.payment_method === 'coinpayments')
    );
    
    if (!pendingCryptoTransactions.length) return;
    
    // Set up an interval to check status periodically
    const intervalId = setInterval(async () => {
      let hasStatusChanges = false;
      
      for (const tx of pendingCryptoTransactions) {
        try {
          const { data, error } = await supabase.functions.invoke('create-crypto-payment/status', {
            body: { transactionId: tx.transaction_id }
          });
          
          if (error) continue;
          
          // If status has changed from pending, update the local state
          if (data?.status && data.status !== 'pending') {
            hasStatusChanges = true;
            
            // Show a toast notification for status change
            if (data.status === 'completed') {
              toast.success(`Transaction ${tx.transaction_id.substring(0, 6)}... has been completed!`);
            } else if (data.status === 'failed') {
              toast.error(`Transaction ${tx.transaction_id.substring(0, 6)}... has failed.`);
            }
          }
        } catch (error) {
          console.error(`Error checking status for transaction ${tx.transaction_id}:`, error);
        }
      }
      
      // If any status changes, refresh the transactions list
      if (hasStatusChanges) {
        fetchTransactions();
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(intervalId);
  }, [transactions, fetchTransactions]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchTransactions();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-cbis-blue mr-2" />
        <span>Loading transactions...</span>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-sm font-medium text-gray-900">No transactions yet</h3>
        <p className="text-sm text-gray-500 mt-1 mb-4">When you make a payment, it will appear here.</p>
        
        <Button asChild className="bg-gradient-to-r from-cbis-blue to-cbis-teal">
          <Link to="/dashboard/payments" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Buy Tokens Now
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  {new Date(transaction.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>${transaction.amount.toFixed(2)}</TableCell>
                <TableCell className="capitalize">
                  {transaction.payment_method}
                </TableCell>
                <TableCell>
                  <StatusBadge status={transaction.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusProps = () => {
    switch (status) {
      case 'completed':
        return { variant: 'success', label: 'Completed' };
      case 'pending':
        return { variant: 'warning', label: 'Pending' };
      case 'failed':
        return { variant: 'destructive', label: 'Failed' };
      default:
        return { variant: 'outline', label: status };
    }
  };

  const { variant, label } = getStatusProps();
  
  return (
    <Badge 
      variant={variant as "default" | "secondary" | "destructive" | "outline"}
      className={`
        ${variant === 'success' ? 'bg-green-100 text-green-800 hover:bg-green-100' : ''}
        ${variant === 'warning' ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' : ''}
        ${variant === 'destructive' ? 'bg-red-100 text-red-800 hover:bg-red-100' : ''}
      `}
    >
      {label}
    </Badge>
  );
};

export default TransactionsList;

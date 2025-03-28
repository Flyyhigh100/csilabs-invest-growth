
import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, CreditCard, DollarSign } from 'lucide-react';
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

  useEffect(() => {
    const fetchTransactions = async () => {
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
      }
    };

    fetchTransactions();
  }, [user]);

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

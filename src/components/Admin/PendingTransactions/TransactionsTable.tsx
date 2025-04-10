
import React from 'react';
import { Clock } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PendingTransactionWithProfile } from '@/hooks/admin/usePendingTransactions';

interface TransactionsTableProps {
  transactions: PendingTransactionWithProfile[];
  onMarkAsSent: (tx: PendingTransactionWithProfile) => void;
}

const TransactionsTable = ({ transactions, onMarkAsSent }: TransactionsTableProps) => {
  // Helper function to safely get user name from profiles
  const getUserName = (tx: PendingTransactionWithProfile): string => {
    if (!tx.profiles) return 'Unknown User';
    
    const firstName = tx.profiles.first_name || '';
    const lastName = tx.profiles.last_name || '';
    
    if (!firstName && !lastName) return 'Unknown User';
    return `${firstName} ${lastName}`.trim();
  };
  
  // Helper function to safely get email from profiles
  const getUserEmail = (tx: PendingTransactionWithProfile): string => {
    return tx.profiles?.email || 'No email available';
  };
  
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>User</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Wallet Address</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Action</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-8 text-gray-500">
              No pending token distributions found
            </TableCell>
          </TableRow>
        ) : (
          transactions.map((tx) => (
            <TableRow key={tx.id}>
              <TableCell>
                {new Date(tx.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <div className="font-medium">
                  {getUserName(tx)}
                </div>
                <div className="text-xs text-gray-500">{getUserEmail(tx)}</div>
              </TableCell>
              <TableCell>${tx.amount.toFixed(2)}</TableCell>
              <TableCell>
                <div className="font-mono text-xs max-w-[150px] truncate">
                  {tx.wallet_address}
                </div>
              </TableCell>
              <TableCell>
                <Badge className="bg-amber-500">
                  <Clock className="h-3 w-3 mr-1" />
                  Pending Distribution
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button 
                  size="sm"
                  onClick={() => onMarkAsSent(tx)}
                >
                  Mark as Sent
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default TransactionsTable;

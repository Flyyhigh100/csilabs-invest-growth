
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
        {transactions.map((tx) => (
          <TableRow key={tx.id}>
            <TableCell>
              {new Date(tx.created_at).toLocaleDateString()}
            </TableCell>
            <TableCell>
              <div className="font-medium">
                {tx.profiles ? `${tx.profiles.first_name || ''} ${tx.profiles.last_name || ''}` : 'Unknown User'}
              </div>
              <div className="text-xs text-gray-500">{tx.profiles?.email || 'No email available'}</div>
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
        ))}
      </TableBody>
    </Table>
  );
};

export default TransactionsTable;

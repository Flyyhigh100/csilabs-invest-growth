
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import { Transaction } from '@/types/transactions';
import StatusBadge from './StatusBadge';
import PaymentMethodIcon from './PaymentMethodIcon';

interface TransactionsTableProps {
  transactions: Transaction[];
  expandedItem: string | null;
  setExpandedItem: (id: string | null) => void;
}

const TransactionsTable = ({ 
  transactions, 
  expandedItem, 
  setExpandedItem 
}: TransactionsTableProps) => (
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
              <PaymentMethodIcon method={transaction.payment_method} />
              <span className="ml-2 capitalize">{transaction.payment_method}</span>
            </div>
          </TableCell>
          <TableCell>
            <StatusBadge transaction={transaction} />
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
);

export default TransactionsTable;

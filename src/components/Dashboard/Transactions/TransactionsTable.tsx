
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatusBadge from './StatusBadge';
import PaymentMethodIcon from './PaymentMethodIcon';
import { Transaction } from '@/types/transactions';
import SyncStripePaymentButton from './SyncStripePaymentButton';

interface TransactionsTableProps {
  transactions: Transaction[];
  expandedItem: string | null;
  setExpandedItem: (id: string | null) => void;
  onSyncComplete?: (updatedTransaction: Transaction | null) => void;
}

const TransactionsTable: React.FC<TransactionsTableProps> = ({
  transactions,
  expandedItem,
  setExpandedItem,
  onSyncComplete
}) => {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const toggleExpand = (id: string) => {
    if (expandedItem === id) {
      setExpandedItem(null);
    } else {
      setExpandedItem(id);
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[80px]">Date</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Method</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transactions.map((tx) => (
          <TableRow 
            key={tx.id}
            className="cursor-pointer hover:bg-muted/50"
            onClick={() => toggleExpand(tx.id)}
          >
            <TableCell>{formatDate(tx.created_at)}</TableCell>
            <TableCell>{formatAmount(tx.amount)}</TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <PaymentMethodIcon method={tx.payment_method} />
                <span className="capitalize">{tx.payment_method}</span>
              </div>
            </TableCell>
            <TableCell>
              <StatusBadge status={tx.status} />
              {tx.status === 'pending' && tx.payment_method === 'stripe' && tx.external_transaction_id && (
                <div className="mt-1" onClick={(e) => e.stopPropagation()}>
                  <SyncStripePaymentButton 
                    transaction={tx}
                    onSyncComplete={onSyncComplete}
                  />
                </div>
              )}
            </TableCell>
            <TableCell className="text-right">
              <Button variant="ghost" size="sm">
                {expandedItem === tx.id ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default TransactionsTable;

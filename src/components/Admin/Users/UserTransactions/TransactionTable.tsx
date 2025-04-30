
import React from 'react';
import { formatCurrency } from '@/utils/format';
import { Transaction } from '@/types/transactions';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, ExternalLink } from 'lucide-react';

interface TransactionTableProps {
  transactions: Transaction[];
  isLoading: boolean;
  onSelectTransaction: (transaction: Transaction) => void;
}

const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  isLoading,
  onSelectTransaction
}) => {
  if (isLoading) {
    return (
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Token Sent</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(5)].map((_, i) => (
              <TableRow key={i}>
                <TableCell colSpan={7} className="p-4">
                  <div className="h-6 bg-gray-100 rounded animate-pulse"></div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (!transactions.length) {
    return (
      <div className="text-center py-10 border rounded-md">
        <p className="text-muted-foreground">No transactions found</p>
        <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
      </div>
    );
  }

  const renderStatus = (status: string | null) => {
    if (!status) return <Badge variant="outline">Unknown</Badge>;
    
    switch(status.toLowerCase()) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      case 'canceled':
        return <Badge className="bg-gray-100 text-gray-800">Canceled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>ID</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Method</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Token Sent</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => (
            <TableRow key={transaction.id} className="hover:bg-muted/50">
              <TableCell>
                {new Date(transaction.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell>
                <div className="font-mono text-xs max-w-[120px] truncate" title={transaction.transaction_id}>
                  {transaction.transaction_id}
                </div>
              </TableCell>
              <TableCell>{formatCurrency(transaction.amount)}</TableCell>
              <TableCell className="capitalize">{transaction.payment_method}</TableCell>
              <TableCell>{renderStatus(transaction.status)}</TableCell>
              <TableCell>
                {transaction.token_sent ? (
                  <Badge className="bg-green-100 text-green-800">Yes</Badge>
                ) : (
                  <Badge variant="outline">No</Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => onSelectTransaction(transaction)}
                    title="View details"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  {transaction.blockchain_tx_id && (
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => window.open(`https://polygonscan.com/tx/${transaction.blockchain_tx_id}`, '_blank')}
                      title="View on blockchain"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default TransactionTable;

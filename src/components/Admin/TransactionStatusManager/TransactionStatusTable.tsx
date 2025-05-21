import React, { useState } from 'react';
import { format } from 'date-fns';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  AlertTriangle,
  Check,
  ClipboardCopy,
  ExternalLink,
  History,
  Loader2,
  RefreshCw,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { Transaction } from '@/types/transactions';
import UpdateStatusDialog from './UpdateStatusDialog';
import { mapStatusToBadgeVariant } from '@/utils/admin/transactions/statusMapping';
import { formatCurrency } from '@/utils/format';

interface TransactionStatusTableProps {
  transactions: Transaction[];
  isLoading: boolean;
  onUpdateStatus: (transactionId: string, newStatus: string) => Promise<boolean>;
  onRefresh: () => void;
}

const TransactionStatusTable: React.FC<TransactionStatusTableProps> = ({
  transactions,
  isLoading,
  onUpdateStatus,
  onRefresh
}) => {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false);
  
  const handleUpdateStatus = async (txId: string, newStatus: string) => {
    setUpdatingId(txId);
    try {
      const success = await onUpdateStatus(txId, newStatus);
      if (success) {
        toast.success(`Transaction status updated successfully`);
        setIsUpdateDialogOpen(false);
      } else {
        toast.error(`Failed to update transaction status`);
      }
    } catch (error) {
      toast.error(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUpdatingId(null);
    }
  };
  
  const copyToClipboard = (text: string, description: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${description}`, {
      description: text,
    });
  };

  const openUpdateDialog = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsUpdateDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading transactions...</p>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-amber-500 mb-4 mx-auto" />
          <h3 className="text-lg font-medium">No transactions found</h3>
          <p className="text-muted-foreground mt-2">
            Try adjusting your filters or search criteria
          </p>
          <Button onClick={onRefresh} variant="outline" className="mt-4">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableCaption>
              Showing {transactions.length} transactions
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Transaction ID</TableHead>
                <TableHead>External ID</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Wallet Address</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id} className={tx.is_test ? 'bg-gray-50' : ''}>
                  <TableCell className="font-medium">
                    {format(new Date(tx.created_at), 'MMM d, yyyy')}
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(tx.created_at), 'h:mm a')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-mono truncate max-w-[120px]" title={tx.transaction_id}>
                        {tx.transaction_id}
                      </span>
                      <button 
                        onClick={() => copyToClipboard(tx.transaction_id, 'transaction ID')} 
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <ClipboardCopy className="h-3 w-3" />
                      </button>
                    </div>
                  </TableCell>
                  <TableCell>
                    {tx.external_transaction_id ? (
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-mono truncate max-w-[120px]" title={tx.external_transaction_id}>
                          {tx.external_transaction_id}
                        </span>
                        <button 
                          onClick={() => copyToClipboard(tx.external_transaction_id!, 'external ID')} 
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <ClipboardCopy className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className={`font-mono ${tx.is_test ? 'text-amber-600' : ''}`}>
                      {formatCurrency(tx.amount, tx.currency || 'USD')}
                    </div>
                    {tx.token_amount && (
                      <div className="text-xs text-muted-foreground">
                        {tx.token_amount.toLocaleString()} tokens
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={mapStatusToBadgeVariant(tx.status)}>
                      {tx.status}
                    </Badge>
                    {tx.is_test && (
                      <Badge variant="outline" className="ml-1 text-amber-600 border-amber-200 bg-amber-50">
                        Test
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {tx.payment_method}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-mono truncate max-w-[120px]" title={tx.wallet_address}>
                        {tx.wallet_address}
                      </span>
                      <button 
                        onClick={() => copyToClipboard(tx.wallet_address, 'wallet address')} 
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <ClipboardCopy className="h-3 w-3" />
                      </button>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      {tx.payment_method === 'coinpayments' && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => handleUpdateStatus(tx.id, 'force_check')}
                              disabled={updatingId === tx.id}
                            >
                              {updatingId === tx.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <RefreshCw className="h-3 w-3" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            Check status with payment provider
                          </TooltipContent>
                        </Tooltip>
                      )}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => openUpdateDialog(tx)}
                          >
                            <History className="h-3 w-3" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          Manually update status
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      <UpdateStatusDialog
        isOpen={isUpdateDialogOpen}
        setIsOpen={setIsUpdateDialogOpen}
        transaction={selectedTransaction}
        onUpdateStatus={handleUpdateStatus}
        isUpdating={!!updatingId}
      />
    </>
  );
};

export default TransactionStatusTable;

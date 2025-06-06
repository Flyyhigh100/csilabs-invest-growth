
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
  X,
  User,
  Wallet
} from 'lucide-react';
import { toast } from 'sonner';
import { TransactionWithUser } from '@/hooks/admin/useTransactionManager';
import UpdateStatusDialog from './UpdateStatusDialog';
import { mapStatusToBadgeVariant } from '@/utils/admin/transactions/statusMapping';
import { formatCurrency } from '@/utils/format';

interface TransactionStatusTableProps {
  transactions: TransactionWithUser[];
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
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionWithUser | null>(null);
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

  const openUpdateDialog = (transaction: TransactionWithUser) => {
    setSelectedTransaction(transaction);
    setIsUpdateDialogOpen(true);
  };

  // Helper function to get user display name
  const getUserDisplayName = (tx: TransactionWithUser) => {
    if (!tx.profiles) return 'Unknown User';
    const { first_name, last_name } = tx.profiles;
    if (first_name && last_name) return `${first_name} ${last_name}`;
    if (first_name) return first_name;
    if (last_name) return last_name;
    return 'Unknown User';
  };

  // Helper function to get crypto network badge color
  const getNetworkBadgeColor = (network?: string) => {
    if (!network) return 'bg-gray-100 text-gray-800';
    
    switch (network.toLowerCase()) {
      case 'ethereum':
      case 'eth':
        return 'bg-blue-100 text-blue-800';
      case 'polygon':
      case 'matic':
        return 'bg-purple-100 text-purple-800';
      case 'bsc':
      case 'binance':
        return 'bg-yellow-100 text-yellow-800';
      case 'solana':
      case 'sol':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
                <TableHead>User</TableHead>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Crypto Details</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment Address</TableHead>
                <TableHead>User Wallet</TableHead>
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
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{getUserDisplayName(tx)}</div>
                        <div className="text-xs text-muted-foreground">
                          {tx.profiles?.email || 'No email'}
                        </div>
                      </div>
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
                    {tx.external_transaction_id && (
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-xs font-mono truncate max-w-[120px] text-muted-foreground" title={tx.external_transaction_id}>
                          Ext: {tx.external_transaction_id}
                        </span>
                        <button 
                          onClick={() => copyToClipboard(tx.external_transaction_id!, 'external ID')} 
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <ClipboardCopy className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    <div className="space-y-1">
                      {tx.crypto_currency_symbol && (
                        <Badge variant="outline" className="text-xs">
                          {tx.crypto_currency_symbol.toUpperCase()}
                        </Badge>
                      )}
                      {tx.crypto_network && (
                        <Badge className={`text-xs ${getNetworkBadgeColor(tx.crypto_network)}`}>
                          {tx.crypto_network}
                        </Badge>
                      )}
                      {tx.expected_crypto_amount && (
                        <div className="text-xs text-muted-foreground">
                          Expected: {tx.expected_crypto_amount} {tx.crypto_currency_symbol?.toUpperCase()}
                        </div>
                      )}
                    </div>
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
                    <div className="text-xs text-muted-foreground mt-1">
                      {tx.payment_method}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    {tx.payment_address ? (
                      <div className="flex items-center gap-1">
                        <Wallet className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs font-mono truncate max-w-[120px]" title={tx.payment_address}>
                          {tx.payment_address}
                        </span>
                        <button 
                          onClick={() => copyToClipboard(tx.payment_address!, 'payment address')} 
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <ClipboardCopy className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Wallet className="h-3 w-3 text-blue-600" />
                      <span className="text-xs font-mono truncate max-w-[120px]" title={tx.wallet_address}>
                        {tx.wallet_address}
                      </span>
                      <button 
                        onClick={() => copyToClipboard(tx.wallet_address, 'user wallet')} 
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


import React from 'react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils/format';
import { ExternalLink } from 'lucide-react';
import { TestIconLucide } from '@/components/icons/TestIcon';

interface TransactionDetailSheetProps {
  transaction: any | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TransactionDetailSheet: React.FC<TransactionDetailSheetProps> = ({ transaction, open, onOpenChange }) => {
  if (!transaction) return null;
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };
  
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800">Processing</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            Transaction Details
            {transaction.is_test && (
              <Badge variant="outline" className="bg-amber-100 border-amber-200 text-amber-800 flex gap-1 items-center">
                <TestIconLucide className="h-3 w-3" /> Test Transaction
              </Badge>
            )}
          </SheetTitle>
          <SheetDescription>
            Transaction ID: {transaction.id}
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6">
          <div className="space-y-6">
            {/* Status and Amount */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Status</p>
                {getStatusBadge(transaction.status || 'Unknown')}
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Amount</p>
                <p className={`font-mono text-lg font-bold ${transaction.is_test ? 'text-amber-600' : ''}`}>
                  {formatCurrency(transaction.amount || 0)}
                </p>
                {transaction.is_test && (
                  <p className="text-xs text-amber-600 mt-1">
                    Test data (excluded from real volume)
                  </p>
                )}
              </div>
            </div>
            
            {/* Token Details */}
            {transaction.token_amount && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Token Amount</p>
                  <p className={`font-mono ${transaction.is_test ? 'text-amber-600' : ''}`}>{transaction.token_amount}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Token Price</p>
                  <p className={`font-mono ${transaction.is_test ? 'text-amber-600' : ''}`}>
                    {formatCurrency(transaction.token_price || 0)}
                  </p>
                </div>
              </div>
            )}
            
            {/* Payment Details */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">Payment Details</p>
              <div className="bg-gray-50 p-3 rounded-md space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Method</span>
                  <span className="text-sm font-medium">{transaction.payment_method || 'Not specified'}</span>
                </div>
                {transaction.currency && (
                  <div className="flex justify-between">
                    <span className="text-sm">Currency</span>
                    <span className="text-sm font-medium">{transaction.currency}</span>
                  </div>
                )}
                {transaction.payment_address && (
                  <div>
                    <span className="text-sm block">Payment Address</span>
                    <span className="text-sm font-mono break-all">{transaction.payment_address}</span>
                  </div>
                )}
                {transaction.blockchain_tx_id && (
                  <div>
                    <span className="text-sm flex items-center">
                      Blockchain Transaction
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </span>
                    <span className="text-sm font-mono break-all">{transaction.blockchain_tx_id}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Timestamps */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-muted-foreground">Timeline</p>
              <div className="bg-gray-50 p-3 rounded-md space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Created</span>
                  <span className="text-sm">{formatDate(transaction.created_at)}</span>
                </div>
                {transaction.updated_at && (
                  <div className="flex justify-between">
                    <span className="text-sm">Last Updated</span>
                    <span className="text-sm">{formatDate(transaction.updated_at)}</span>
                  </div>
                )}
                {transaction.completed_at && (
                  <div className="flex justify-between">
                    <span className="text-sm">Completed</span>
                    <span className="text-sm">{formatDate(transaction.completed_at)}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Admin Notes */}
            {transaction.admin_notes && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Admin Notes</p>
                <p className="text-sm bg-gray-50 p-3 rounded-md whitespace-pre-wrap">
                  {transaction.admin_notes}
                </p>
              </div>
            )}
            
            {/* Test Data Warning */}
            {transaction.is_test && (
              <div className="p-3 bg-amber-50 border border-amber-100 rounded-md">
                <p className="text-sm text-amber-800 flex items-center">
                  <TestIconLucide className="h-4 w-4 mr-2" />
                  This is a test transaction and should be excluded from real volume calculations.
                </p>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default TransactionDetailSheet;

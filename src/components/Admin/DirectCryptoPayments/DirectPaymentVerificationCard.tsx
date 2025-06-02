
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, ExternalLink, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { Transaction } from '@/types/transactions';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface DirectPaymentVerificationCardProps {
  transaction: Transaction;
  onApprove?: (transactionId: string) => void;
  onReject?: (transactionId: string) => void;
}

const DirectPaymentVerificationCard: React.FC<DirectPaymentVerificationCardProps> = ({
  transaction,
  onApprove,
  onReject
}) => {
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const isExpired = transaction.payment_timeout_at 
    ? new Date(transaction.payment_timeout_at) < new Date()
    : false;

  // Check if we have estimated token data from purchase time
  const hasEstimatedTokenData = transaction.token_amount && transaction.token_price;

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Direct Crypto Payment</CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(transaction.status)}>
              {transaction.status}
            </Badge>
            {isExpired && (
              <Badge variant="destructive">
                Expired
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Estimated Token Information */}
        {hasEstimatedTokenData && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              <span className="font-medium text-blue-800">Token Estimate from Purchase Time</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <label className="text-blue-600">Estimated CSL Tokens</label>
                <div className="font-semibold text-blue-800">
                  {Number(transaction.token_amount).toLocaleString()} CSL
                </div>
              </div>
              <div>
                <label className="text-blue-600">Price at Purchase</label>
                <div className="font-semibold text-blue-800">
                  ${Number(transaction.token_price).toFixed(4)} per CSL
                </div>
              </div>
            </div>
            <div className="mt-2 text-xs text-blue-600 flex items-center gap-1">
              <AlertCircle className="h-3 w-3" />
              Use this as the default token amount when marking as sent
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Transaction ID</label>
            <div className="flex items-center gap-2">
              <code className="text-sm bg-gray-100 px-2 py-1 rounded flex-1">
                {transaction.transaction_id}
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleCopy(transaction.transaction_id)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">Amount</label>
            <div className="text-lg font-semibold">
              ${transaction.amount} USD
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">Expected Crypto Amount</label>
            <div className="text-lg font-semibold">
              {transaction.expected_crypto_amount} {transaction.crypto_currency_symbol}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">Network</label>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {transaction.crypto_network?.toUpperCase()}
              </Badge>
              <Badge variant="outline">
                {transaction.crypto_currency_symbol}
              </Badge>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="text-sm font-medium text-gray-600">Company Wallet Address</label>
            <div className="flex items-center gap-2">
              <code className="text-sm bg-gray-100 px-2 py-1 rounded flex-1 font-mono">
                {transaction.payment_address}
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleCopy(transaction.payment_address || '')}
              >
                <Copy className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  const baseUrl = transaction.crypto_network === 'polygon' 
                    ? 'https://polygonscan.com/address/'
                    : 'https://solscan.io/account/';
                  window.open(`${baseUrl}${transaction.payment_address}`, '_blank');
                }}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">User Wallet</label>
            <code className="text-sm bg-gray-100 px-2 py-1 rounded block font-mono">
              {transaction.wallet_address}
            </code>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-600">Created</label>
            <div className="text-sm">
              {formatDistanceToNow(new Date(transaction.created_at), { addSuffix: true })}
            </div>
          </div>
        </div>

        {transaction.payment_timeout_at && (
          <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
            <Clock className="h-4 w-4" />
            <span>
              Payment window {isExpired ? 'expired' : 'expires'}{' '}
              {formatDistanceToNow(new Date(transaction.payment_timeout_at), { addSuffix: true })}
            </span>
          </div>
        )}

        {transaction.status === 'pending' && onApprove && onReject && (
          <div className="flex gap-2 pt-2">
            <Button
              onClick={() => onApprove(transaction.id)}
              className="flex-1"
            >
              Approve Payment
            </Button>
            <Button
              variant="outline"
              onClick={() => onReject(transaction.id)}
              className="flex-1"
            >
              Reject Payment
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DirectPaymentVerificationCard;

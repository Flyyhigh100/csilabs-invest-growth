
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, TrendingUp } from 'lucide-react';
import { PendingTransactionWithProfile } from '@/hooks/admin/usePendingTransactions';

interface TransactionDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  selectedTx: PendingTransactionWithProfile | null;
  blockchainTxId: string;
  setBlockchainTxId: (id: string) => void;
  onConfirm: (tokenAmount?: number, tokenPrice?: number) => void;
  isSubmitting: boolean;
}

const TransactionDialog: React.FC<TransactionDialogProps> = ({
  isOpen,
  setIsOpen,
  selectedTx,
  blockchainTxId,
  setBlockchainTxId,
  onConfirm,
  isSubmitting
}) => {
  const [tokenAmount, setTokenAmount] = useState<string>('');
  const [tokenPrice, setTokenPrice] = useState<string>('');
  const [useEstimatedAmount, setUseEstimatedAmount] = useState(true);

  // Check if transaction has estimated token data from purchase time
  const hasEstimatedData = selectedTx?.token_amount && selectedTx?.token_price;

  useEffect(() => {
    if (selectedTx && hasEstimatedData && useEstimatedAmount) {
      // Pre-fill with estimated amounts from purchase time
      setTokenAmount(Number(selectedTx.token_amount).toString());
      setTokenPrice(Number(selectedTx.token_price).toString());
    } else if (selectedTx && !hasEstimatedData) {
      // Clear fields if no estimated data
      setTokenAmount('');
      setTokenPrice('');
    }
  }, [selectedTx, hasEstimatedData, useEstimatedAmount]);

  const handleConfirm = () => {
    const amount = tokenAmount ? Number(tokenAmount) : undefined;
    const price = tokenPrice ? Number(tokenPrice) : undefined;
    onConfirm(amount, price);
  };

  const toggleEstimatedAmount = () => {
    setUseEstimatedAmount(!useEstimatedAmount);
    if (!useEstimatedAmount && hasEstimatedData) {
      // Switch to estimated amounts
      setTokenAmount(Number(selectedTx!.token_amount).toString());
      setTokenPrice(Number(selectedTx!.token_price).toString());
    } else {
      // Clear for manual entry
      setTokenAmount('');
      setTokenPrice('');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Mark Transaction as Sent</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Show estimated token information if available */}
          {hasEstimatedData && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span className="font-medium text-blue-800">Estimated from Purchase Time</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-blue-600">Token Amount:</span>
                  <div className="font-semibold text-blue-800">
                    {Number(selectedTx!.token_amount).toLocaleString()} CSL
                  </div>
                </div>
                <div>
                  <span className="text-blue-600">Price:</span>
                  <div className="font-semibold text-blue-800">
                    ${Number(selectedTx!.token_price).toFixed(4)}
                  </div>
                </div>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="useEstimated"
                  checked={useEstimatedAmount}
                  onChange={toggleEstimatedAmount}
                  className="rounded border-blue-300"
                />
                <label htmlFor="useEstimated" className="text-xs text-blue-600">
                  Use estimated amounts (recommended)
                </label>
              </div>
            </div>
          )}

          {!hasEstimatedData && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-center gap-2 text-amber-800">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">
                  No estimated token data available. Please enter amounts manually.
                </span>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <div>
              <Label htmlFor="blockchain-tx">Blockchain Transaction ID *</Label>
              <Input
                id="blockchain-tx"
                value={blockchainTxId}
                onChange={(e) => setBlockchainTxId(e.target.value)}
                placeholder="Enter blockchain transaction ID"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <Label htmlFor="token-amount">
                Token Amount (CSL)
                {hasEstimatedData && useEstimatedAmount && (
                  <Badge variant="outline" className="ml-2 text-xs bg-blue-50 text-blue-700">
                    From Purchase
                  </Badge>
                )}
              </Label>
              <Input
                id="token-amount"
                type="number"
                step="0.01"
                value={tokenAmount}
                onChange={(e) => setTokenAmount(e.target.value)}
                placeholder="Enter token amount"
                disabled={isSubmitting || (hasEstimatedData && useEstimatedAmount)}
              />
            </div>

            <div>
              <Label htmlFor="token-price">
                Token Price (USD per CSL)
                {hasEstimatedData && useEstimatedAmount && (
                  <Badge variant="outline" className="ml-2 text-xs bg-blue-50 text-blue-700">
                    From Purchase
                  </Badge>
                )}
              </Label>
              <Input
                id="token-price"
                type="number"
                step="0.0001"
                value={tokenPrice}
                onChange={(e) => setTokenPrice(e.target.value)}
                placeholder="Enter token price"
                disabled={isSubmitting || (hasEstimatedData && useEstimatedAmount)}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isSubmitting || !blockchainTxId.trim()}
              className="flex-1"
            >
              {isSubmitting ? 'Processing...' : 'Confirm Sent'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionDialog;

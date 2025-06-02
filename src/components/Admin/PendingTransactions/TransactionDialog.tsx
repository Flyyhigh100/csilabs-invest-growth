
import React, { useState, useEffect } from 'react';
import { Loader2, Calculator } from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { PendingTransactionWithProfile } from '@/hooks/admin/usePendingTransactions';
import { fetchCurrentTokenPrice } from '@/services/api/priceService';
import { toast } from 'sonner';

interface TransactionDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  selectedTx: PendingTransactionWithProfile | null;
  blockchainTxId: string;
  setBlockchainTxId: (id: string) => void;
  onConfirm: (tokenAmount?: number, tokenPrice?: number) => Promise<void>;
  isSubmitting: boolean;
}

const TransactionDialog = ({
  isOpen,
  setIsOpen,
  selectedTx,
  blockchainTxId,
  setBlockchainTxId,
  onConfirm,
  isSubmitting
}: TransactionDialogProps) => {
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [calculatedTokens, setCalculatedTokens] = useState<number>(0);
  const [manualTokenAmount, setManualTokenAmount] = useState<string>('');
  const [isLoadingPrice, setIsLoadingPrice] = useState(false);
  const [useManualAmount, setUseManualAmount] = useState(false);

  // Fetch current TWAP price when dialog opens
  useEffect(() => {
    if (isOpen && selectedTx) {
      fetchTokenPrice();
      setManualTokenAmount('');
      setUseManualAmount(false);
    }
  }, [isOpen, selectedTx]);

  // Calculate tokens when price is fetched
  useEffect(() => {
    if (currentPrice && selectedTx?.amount) {
      const tokens = Number(selectedTx.amount) / currentPrice;
      setCalculatedTokens(tokens);
      setManualTokenAmount(tokens.toFixed(2));
    }
  }, [currentPrice, selectedTx?.amount]);

  const fetchTokenPrice = async () => {
    try {
      setIsLoadingPrice(true);
      const priceResult = await fetchCurrentTokenPrice();
      setCurrentPrice(priceResult.price);
    } catch (error) {
      console.error('Error fetching token price:', error);
      toast.error('Failed to fetch current token price');
    } finally {
      setIsLoadingPrice(false);
    }
  };

  const handleConfirm = async () => {
    if (!blockchainTxId.trim()) {
      toast.error('Please enter a blockchain transaction ID');
      return;
    }

    const finalTokenAmount = useManualAmount 
      ? Number(manualTokenAmount) 
      : calculatedTokens;

    if (finalTokenAmount <= 0) {
      toast.error('Token amount must be greater than 0');
      return;
    }

    await onConfirm(finalTokenAmount, currentPrice || undefined);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Mark Tokens as Sent</DialogTitle>
          <DialogDescription>
            Enter the blockchain transaction ID and confirm token amount calculation.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="wallet">Destination Wallet</Label>
            <Input 
              id="wallet" 
              value={selectedTx?.wallet_address || ''}
              readOnly
              className="font-mono text-sm bg-gray-50"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="amount">Purchase Amount</Label>
            <Input 
              id="amount" 
              value={selectedTx ? `$${Number(selectedTx.amount).toFixed(2)}` : ''}
              readOnly
              className="bg-gray-50"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="current_price" className="flex items-center gap-2">
              Current CSL Price (TWAP)
              {isLoadingPrice && <Loader2 className="h-4 w-4 animate-spin" />}
            </Label>
            <div className="flex gap-2">
              <Input 
                id="current_price" 
                value={currentPrice ? `$${currentPrice.toFixed(6)}` : 'Loading...'}
                readOnly
                className="bg-gray-50"
              />
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={fetchTokenPrice}
                disabled={isLoadingPrice}
              >
                <Calculator className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="calculated_tokens">Calculated Token Amount</Label>
            <Input 
              id="calculated_tokens" 
              value={calculatedTokens > 0 ? `${calculatedTokens.toFixed(2)} CSL` : 'Calculating...'}
              readOnly
              className="bg-green-50 font-medium"
            />
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="manual_override"
              checked={useManualAmount}
              onChange={(e) => setUseManualAmount(e.target.checked)}
            />
            <Label htmlFor="manual_override" className="text-sm">
              Manually specify token amount
            </Label>
          </div>

          {useManualAmount && (
            <div className="grid gap-2">
              <Label htmlFor="manual_tokens">Manual Token Amount</Label>
              <Input 
                id="manual_tokens" 
                type="number"
                step="0.01"
                value={manualTokenAmount}
                onChange={(e) => setManualTokenAmount(e.target.value)}
                placeholder="Enter token amount"
              />
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="tx_id">Blockchain Transaction ID</Label>
            <Input 
              id="tx_id" 
              placeholder="0x..."
              value={blockchainTxId}
              onChange={(e) => setBlockchainTxId(e.target.value)}
              className="font-mono"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={isSubmitting || isLoadingPrice || !currentPrice}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              'Confirm'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TransactionDialog;

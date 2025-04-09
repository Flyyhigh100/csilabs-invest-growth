
import React from 'react';
import { Loader2 } from 'lucide-react';
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

interface TransactionDialogProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  selectedTx: PendingTransactionWithProfile | null;
  blockchainTxId: string;
  setBlockchainTxId: (id: string) => void;
  onConfirm: () => Promise<void>;
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
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Mark Tokens as Sent</DialogTitle>
          <DialogDescription>
            Enter the blockchain transaction ID for verification purposes.
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
            <Label htmlFor="amount">Amount</Label>
            <Input 
              id="amount" 
              value={selectedTx ? `$${Number(selectedTx.amount).toFixed(2)}` : ''}
              readOnly
              className="bg-gray-50"
            />
          </div>
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
            onClick={onConfirm} 
            disabled={isSubmitting}
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


import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  CheckSquare, 
  ChevronDown, 
  Download,
  CheckCircle2
} from 'lucide-react';
import DownloadCSVButton from './DownloadCSVButton';
import { PendingTransactionWithProfile } from '@/hooks/admin/usePendingTransactions';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface BulkActionsBarProps {
  selectedTransactions: PendingTransactionWithProfile[];
  onMarkAsSent: (transactionIds: string[], blockchainTxId: string) => Promise<void>;
  disabled?: boolean;
}

const BulkActionsBar: React.FC<BulkActionsBarProps> = ({ 
  selectedTransactions,
  onMarkAsSent,
  disabled = false
}) => {
  const [isSentDialogOpen, setIsSentDialogOpen] = useState(false);
  const [blockchainTxId, setBlockchainTxId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const hasSelected = selectedTransactions.length > 0;
  
  const handleOpenSentDialog = () => {
    setBlockchainTxId('');
    setIsSentDialogOpen(true);
  };
  
  const handleMarkAsSent = async () => {
    if (!blockchainTxId.trim()) return;
    
    setIsSubmitting(true);
    try {
      const transactionIds = selectedTransactions.map(tx => tx.id);
      await onMarkAsSent(transactionIds, blockchainTxId);
      setIsSentDialogOpen(false);
    } catch (error) {
      console.error('Error marking transactions as sent:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!hasSelected) {
    return null;
  }
  
  return (
    <>
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
          {selectedTransactions.length} selected
        </div>
        
        <div className="flex gap-2 ml-auto">
          <DownloadCSVButton 
            transactions={[]} 
            selectedTransactions={selectedTransactions} 
          />
          
          <Button
            onClick={handleOpenSentDialog}
            disabled={disabled || isSubmitting}
            className="flex items-center gap-2"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Mark Selected as Sent</span>
          </Button>
        </div>
      </div>
      
      <Dialog open={isSentDialogOpen} onOpenChange={setIsSentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark {selectedTransactions.length} transactions as sent</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <Label htmlFor="txId">Blockchain Transaction ID</Label>
            <Input
              id="txId"
              value={blockchainTxId}
              onChange={(e) => setBlockchainTxId(e.target.value)}
              placeholder="0x..."
              className="mt-2"
            />
            
            <div className="text-sm text-muted-foreground mt-2">
              Enter the blockchain transaction hash that contains these token transfers
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsSentDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleMarkAsSent}
              disabled={!blockchainTxId.trim() || isSubmitting}
            >
              {isSubmitting ? 'Processing...' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BulkActionsBar;

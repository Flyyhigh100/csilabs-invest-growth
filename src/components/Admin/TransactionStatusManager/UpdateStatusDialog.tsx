
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { Transaction } from '@/types/transactions';
import { mapStatusToBadgeVariant } from '@/utils/admin/transactions/statusMapping';

interface UpdateStatusDialogProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  transaction: Transaction | null;
  onUpdateStatus: (transactionId: string, newStatus: string) => Promise<void>;
  isUpdating: boolean;
}

const UpdateStatusDialog: React.FC<UpdateStatusDialogProps> = ({
  isOpen,
  setIsOpen,
  transaction,
  onUpdateStatus,
  isUpdating,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  
  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
  };

  const handleUpdateStatus = async () => {
    if (!transaction || !selectedStatus) return;
    
    await onUpdateStatus(transaction.id, selectedStatus);
    
    // Reset form
    setSelectedStatus('');
    setNotes('');
  };

  // Reset form when dialog opens
  React.useEffect(() => {
    if (isOpen && transaction) {
      setSelectedStatus('');
      setNotes('');
    }
  }, [isOpen, transaction]);

  if (!transaction) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Update Transaction Status</DialogTitle>
          <DialogDescription>
            Manually change the status of this transaction
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Transaction info summary */}
          <div className="space-y-2 bg-gray-50 p-3 rounded-md text-sm">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-muted-foreground">Transaction ID:</span>
                <div className="font-mono text-xs break-all">{transaction.transaction_id}</div>
              </div>
              <div>
                <span className="text-muted-foreground">External ID:</span>
                <div className="font-mono text-xs break-all">
                  {transaction.external_transaction_id || '-'}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <span className="text-muted-foreground">Amount:</span>
                <div className="font-medium">{transaction.amount} {transaction.currency || 'USD'}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Current Status:</span>
                <div>
                  <Badge variant={mapStatusToBadgeVariant(transaction.status)}>
                    {transaction.status}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="status">New Status</Label>
            <Select onValueChange={handleStatusChange} value={selectedStatus}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Select new status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Admin Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this status change (optional)"
            />
          </div>
          
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-md flex items-start gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
            <div className="text-xs">
              Manually changing transaction status is an administrative action. This will override the 
              payment provider's status and should be used with caution. Changes will be logged.
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isUpdating}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateStatus} 
            disabled={!selectedStatus || isUpdating}
          >
            {isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              'Update Status'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateStatusDialog;

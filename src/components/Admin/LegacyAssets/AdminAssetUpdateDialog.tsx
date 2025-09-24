import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Shield, Calculator } from 'lucide-react';
import { LegacyAssetType } from '@/hooks/useLegacyAssets';

interface AdminAssetUpdateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (amount: number, reason: string) => void;
  assetType: LegacyAssetType;
  currentAmount: number;
  suggestedAmount?: number;
  userName: string;
  isPending?: boolean;
}

export const AdminAssetUpdateDialog: React.FC<AdminAssetUpdateDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  assetType,
  currentAmount,
  suggestedAmount,
  userName,
  isPending = false
}) => {
  const [newAmount, setNewAmount] = useState(() => {
    return suggestedAmount !== undefined ? suggestedAmount.toString() : currentAmount.toString();
  });
  const [reason, setReason] = useState(() => {
    return suggestedAmount !== undefined ? 'Synced from transaction total' : '';
  });

  // Update amount when suggestedAmount changes
  React.useEffect(() => {
    if (suggestedAmount !== undefined) {
      setNewAmount(suggestedAmount.toString());
      setReason('Synced from transaction total');
    } else {
      setNewAmount(currentAmount.toString());
      setReason('');
    }
  }, [suggestedAmount, currentAmount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(newAmount) || 0;
    if (amount >= 0 && reason.trim()) {
      onConfirm(amount, reason.trim());
      setReason('');
      onClose();
    }
  };

  const handleClose = () => {
    setNewAmount(suggestedAmount !== undefined ? suggestedAmount.toString() : currentAmount.toString());
    setReason(suggestedAmount !== undefined ? 'Synced from transaction total' : '');
    onClose();
  };

  const amountChange = parseFloat(newAmount) - currentAmount;
  const isSignificantChange = Math.abs(amountChange) > 100;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-orange-600" />
            Admin Asset Update
          </DialogTitle>
          <DialogDescription>
            Update legacy asset for <strong>{userName}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Asset Type</Label>
            <div className="p-2 bg-muted rounded border">
              <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-200">
                {assetType}
              </Badge>
            </div>
          </div>

          {suggestedAmount !== undefined && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-blue-800">
                <Calculator className="h-4 w-4" />
                <span className="font-medium text-sm">Sync Suggestion</span>
              </div>
              <p className="text-xs text-blue-600 mt-1">
                Pre-populated with calculated total: {suggestedAmount.toLocaleString()} shares
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Current Amount</Label>
              <Input
                value={currentAmount.toLocaleString()}
                readOnly
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label>New Amount*</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                required
                className="border-orange-200"
              />
            </div>
          </div>

          {amountChange !== 0 && (
            <div className={`p-3 rounded-lg border ${
              amountChange > 0 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <div className="flex items-center gap-2">
                {isSignificantChange && <AlertTriangle className="h-4 w-4" />}
                <span className="font-medium">
                  Change: {amountChange > 0 ? '+' : ''}{amountChange.toLocaleString()} shares
                </span>
                {isSignificantChange && (
                  <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                    Significant
                  </Badge>
                )}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label>Reason for Change*</Label>
            <Textarea
              placeholder="Please provide a reason for this admin adjustment..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              rows={3}
              className="border-orange-200"
            />
            <p className="text-xs text-muted-foreground">
              This reason will be logged in the audit trail and visible to compliance.
            </p>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!reason.trim() || isPending || parseFloat(newAmount) < 0}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {isPending ? 'Updating...' : 'Confirm Update'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdminAssetUpdateDialog;
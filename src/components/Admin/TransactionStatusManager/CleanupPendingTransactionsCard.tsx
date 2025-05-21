
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Loader2, Trash2 } from 'lucide-react';

interface CleanupPendingTransactionsCardProps {
  onCleanup: () => Promise<void>;
  isLoading: boolean;
  olderThan: number;
  setOlderThan: (days: number) => void;
}

const CleanupPendingTransactionsCard: React.FC<CleanupPendingTransactionsCardProps> = ({
  onCleanup,
  isLoading,
  olderThan,
  setOlderThan,
}) => {
  return (
    <Card className="bg-amber-50 border-amber-200">
      <CardContent className="pt-6">
        <div className="flex flex-col space-y-4">
          <div>
            <h3 className="font-semibold text-amber-900">Clean Up Old Pending Transactions</h3>
            <p className="text-sm text-amber-700">
              Update the status of pending CoinPayments transactions that are older than the selected days
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-amber-800">Older Than (days)</Label>
              <span className="font-medium text-amber-900">{olderThan} days</span>
            </div>
            <Slider
              value={[olderThan]}
              onValueChange={(value) => setOlderThan(value[0])}
              max={30}
              min={1}
              step={1}
              className="[&>span:nth-child(2)]:bg-amber-600"
            />
          </div>
          
          <Button
            onClick={onCleanup}
            disabled={isLoading}
            className="bg-amber-600 hover:bg-amber-700 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Check & Update Old Transactions
              </>
            )}
          </Button>
          
          <div className="text-xs text-amber-700">
            This will check and update the status of all pending CoinPayments transactions older than {olderThan} days
            that may be expired or cancelled in the payment provider but still showing as pending in your system.
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CleanupPendingTransactionsCard;

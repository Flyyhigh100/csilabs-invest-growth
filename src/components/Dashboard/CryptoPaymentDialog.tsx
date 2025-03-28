
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Info } from 'lucide-react';

interface CryptoPaymentDetailsType {
  paymentAddress: string;
  transactionId: string;
  instructions: string;
}

interface CryptoPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentDetails: CryptoPaymentDetailsType | null;
  amount: number;
}

const CryptoPaymentDialog: React.FC<CryptoPaymentDialogProps> = ({
  open,
  onOpenChange,
  paymentDetails,
  amount
}) => {
  if (!paymentDetails) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cryptocurrency Payment</DialogTitle>
          <DialogDescription>
            Follow these instructions to complete your purchase
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Payment Address (USDC on Polygon)</Label>
            <div className="p-2 bg-gray-100 rounded-md font-mono text-sm break-all">
              {paymentDetails.paymentAddress}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Amount</Label>
            <div className="p-2 bg-gray-100 rounded-md">
              {amount} USDC
            </div>
          </div>
          
          <Alert>
            <Info className="h-5 w-5" />
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
              {paymentDetails.instructions}
            </AlertDescription>
          </Alert>
          
          <p className="text-sm text-muted-foreground">
            Transaction ID: {paymentDetails.transactionId}
          </p>
        </div>
        
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CryptoPaymentDialog;

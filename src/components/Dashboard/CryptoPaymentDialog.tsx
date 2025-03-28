
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Info, ExternalLink } from 'lucide-react';
import { AspectRatio } from "@/components/ui/aspect-ratio";

interface CryptoPaymentDetailsType {
  paymentAddress: string;
  transactionId: string;
  instructions: string;
  qrCodeUrl?: string;
  statusUrl?: string;
  expiresAt?: string;
  externalTransactionId?: string;
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
  
  const expiryDate = paymentDetails.expiresAt 
    ? new Date(paymentDetails.expiresAt) 
    : null;
    
  const isExpired = expiryDate ? new Date() > expiryDate : false;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Cryptocurrency Payment</DialogTitle>
          <DialogDescription>
            Follow these instructions to complete your purchase
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {paymentDetails.qrCodeUrl && (
            <div className="mx-auto w-48 mb-4">
              <AspectRatio ratio={1}>
                <img 
                  src={paymentDetails.qrCodeUrl} 
                  alt="Payment QR Code" 
                  className="rounded-md border object-cover"
                />
              </AspectRatio>
            </div>
          )}
          
          <div className="space-y-2">
            <Label>Payment Address {paymentDetails.externalTransactionId ? '(USDT on Polygon)' : '(USDC on Polygon)'}</Label>
            <div className="p-2 bg-gray-100 rounded-md font-mono text-sm break-all">
              {paymentDetails.paymentAddress}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Amount</Label>
            <div className="p-2 bg-gray-100 rounded-md">
              {amount} {paymentDetails.externalTransactionId ? 'USDT' : 'USDC'}
            </div>
          </div>
          
          {expiryDate && (
            <div className="space-y-2">
              <Label>Expires</Label>
              <div className={`p-2 rounded-md ${isExpired ? 'bg-red-100 text-red-800' : 'bg-gray-100'}`}>
                {expiryDate.toLocaleString()}
                {isExpired && ' (Expired)'}
              </div>
            </div>
          )}
          
          <Alert>
            <Info className="h-5 w-5" />
            <AlertTitle>Important</AlertTitle>
            <AlertDescription>
              {paymentDetails.instructions}
            </AlertDescription>
          </Alert>
          
          {paymentDetails.statusUrl && (
            <Button 
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
              onClick={() => window.open(paymentDetails.statusUrl, '_blank')}
            >
              <ExternalLink size={16} />
              Check Payment Status
            </Button>
          )}
          
          <div className="text-sm text-muted-foreground">
            <div>Transaction ID: {paymentDetails.transactionId}</div>
            {paymentDetails.externalTransactionId && (
              <div>Payment ID: {paymentDetails.externalTransactionId}</div>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CryptoPaymentDialog;

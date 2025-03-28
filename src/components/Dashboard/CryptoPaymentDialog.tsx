
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Info, ExternalLink, Copy, CheckCircle } from 'lucide-react';
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { toast } from 'sonner';

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
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  
  if (!paymentDetails) return null;
  
  const expiryDate = paymentDetails.expiresAt 
    ? new Date(paymentDetails.expiresAt) 
    : null;
    
  const isExpired = expiryDate ? new Date() > expiryDate : false;
  
  const handleCopyAddress = () => {
    if (paymentDetails.paymentAddress) {
      navigator.clipboard.writeText(paymentDetails.paymentAddress)
        .then(() => {
          setCopySuccess(true);
          toast.success('Payment address copied to clipboard');
          setTimeout(() => setCopySuccess(false), 3000);
        })
        .catch(err => {
          console.error('Failed to copy: ', err);
          toast.error('Failed to copy address');
        });
    }
  };
  
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
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-md font-mono text-sm break-all flex-1 mr-2">
                {paymentDetails.paymentAddress}
              </div>
              <Button
                type="button"
                size="icon"
                variant="outline"
                onClick={handleCopyAddress}
                title="Copy address"
                className="flex-shrink-0"
              >
                {copySuccess ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
              </Button>
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


import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Info, ExternalLink, Copy, CheckCircle } from 'lucide-react';
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { toast } from 'sonner';

interface CryptoPaymentDetailsType {
  paymentAddress: string;
  transactionId: string;
  instructions: string;
  qrCodeUrl?: string;
  statusUrl?: string;
  expiresAt?: string;
  externalTransactionId?: string;
  currency?: string;
}

interface CryptoPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentDetails: CryptoPaymentDetailsType | null;
  amount: number;
  selectedCurrency: string;
}

const CryptoPaymentDialog: React.FC<CryptoPaymentDialogProps> = ({
  open,
  onOpenChange,
  paymentDetails,
  amount,
  selectedCurrency
}) => {
  const [copySuccess, setCopySuccess] = useState<boolean>(false);
  const [showQrExpanded, setShowQrExpanded] = useState<boolean>(false);
  
  if (!paymentDetails) return null;
  
  const expiryDate = paymentDetails.expiresAt 
    ? new Date(paymentDetails.expiresAt) 
    : null;
    
  const isExpired = expiryDate ? new Date() > expiryDate : false;
  
  // Use the currency from paymentDetails if available, otherwise fall back to the selectedCurrency from props
  const currency = paymentDetails.currency || selectedCurrency;
  const networkName = getNetworkForCurrency(currency);
  
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
  
  // Helper function to determine the network name based on the currency
  function getNetworkForCurrency(currencyCode: string): string {
    switch (currencyCode) {
      case 'BTC':
        return 'Bitcoin';
      case 'ETH':
        return 'Ethereum';
      case 'DOGE':
        return 'Dogecoin';
      case 'XRP':
        return 'Ripple';
      case 'LTCT':
        return 'Litecoin Testnet';
      case 'USDT':
      default:
        return 'Polygon';
    }
  }
  
  return (
    <>
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
              <div className="mx-auto w-48 mb-4 cursor-pointer" onClick={() => setShowQrExpanded(true)}>
                <AspectRatio ratio={1}>
                  <img 
                    src={paymentDetails.qrCodeUrl} 
                    alt="Payment QR Code" 
                    className="rounded-md border object-cover"
                  />
                </AspectRatio>
                <p className="text-xs text-center mt-1 text-muted-foreground">Click to enlarge QR code</p>
              </div>
            )}
            
            <div className="space-y-2">
              <Label>Payment Address ({currency} on {networkName})</Label>
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
                {amount} {currency}
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
                {paymentDetails.instructions || `Please send ${amount} ${currency} to the address above to complete your purchase.`}
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
      
      {/* Expanded QR code sheet */}
      <Sheet open={showQrExpanded} onOpenChange={setShowQrExpanded}>
        <SheetContent side="bottom" className="h-auto max-h-[90vh] overflow-auto">
          <SheetHeader className="mb-4">
            <SheetTitle>QR Code</SheetTitle>
            <SheetDescription>
              Scan this QR code with your crypto wallet app
            </SheetDescription>
          </SheetHeader>
          
          <div className="max-w-sm mx-auto">
            {paymentDetails.qrCodeUrl && (
              <img 
                src={paymentDetails.qrCodeUrl} 
                alt="Payment QR Code" 
                className="w-full h-auto border rounded-lg"
              />
            )}
            
            <div className="mt-6 space-y-4">
              <div>
                <Label>Payment Address</Label>
                <div className="p-2 bg-gray-100 rounded-md font-mono text-sm break-all mt-1">
                  {paymentDetails.paymentAddress}
                </div>
              </div>
              
              <div>
                <Label>Amount</Label>
                <div className="p-2 bg-gray-100 rounded-md mt-1">
                  {amount} {currency}
                </div>
              </div>
              
              <Button onClick={handleCopyAddress} className="w-full mt-4" variant="secondary">
                {copySuccess ? <CheckCircle className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                Copy Address
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default CryptoPaymentDialog;


import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { ExternalLink, AlertCircle, Wallet, Copy, AlertTriangle } from 'lucide-react';
import { CryptoPaymentDetails } from '@/hooks/payments/types';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface CryptoPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentDetails: CryptoPaymentDetails;
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
  if (!paymentDetails) return null;
  
  const { 
    paymentAddress, 
    instructions, 
    qrCodeUrl, 
    statusUrl, 
    expiresAt,
    usdValue,
    tokenAmount,
    tokenPrice
  } = paymentDetails;

  // Format expiration time if available
  const expirationFormatted = expiresAt ? new Date(expiresAt).toLocaleString() : 'Unknown';
  
  // Calculate time remaining if expiration is available
  const getTimeRemaining = () => {
    if (!expiresAt) return null;
    
    const now = new Date();
    const expiration = new Date(expiresAt);
    const diff = expiration.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const minutes = Math.floor(diff / 1000 / 60);
    const seconds = Math.floor((diff / 1000) % 60);
    return `${minutes}m ${seconds}s`;
  };
  
  const [timeRemaining, setTimeRemaining] = React.useState(getTimeRemaining());
  
  // Update time remaining every second
  React.useEffect(() => {
    if (!expiresAt) return;
    
    const timer = setInterval(() => {
      setTimeRemaining(getTimeRemaining());
    }, 1000);
    
    return () => clearInterval(timer);
  }, [expiresAt]);
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            <span>Crypto Payment Instructions</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex flex-col gap-4 py-4">
          {expiresAt && (
            <Alert variant="default" className="bg-amber-50">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Time Remaining</AlertTitle>
              <AlertDescription>
                This payment expires in <span className="font-bold">{timeRemaining}</span>
              </AlertDescription>
            </Alert>
          )}
          
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 text-center">
            <h4 className="font-medium text-gray-800 mb-1">Purchase Summary</h4>
            <p className="text-gray-600 text-sm">USD Amount: <strong>${usdValue?.toFixed(2)}</strong></p>
            {tokenAmount && tokenPrice && (
              <p className="text-gray-600 text-sm mt-1">
                Token Amount: <strong>{tokenAmount.toLocaleString(undefined, { maximumFractionDigits: 5 })}</strong>
                <br />
                <span className="text-xs text-gray-500">(at ${tokenPrice.toFixed(5)} per token)</span>
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <label className="font-medium text-sm">Send {selectedCurrency} to this address:</label>
            <div className="flex">
              <div className="flex-1 bg-gray-50 border border-r-0 rounded-l-md p-3 overflow-x-auto text-xs">
                <code>{paymentAddress}</code>
              </div>
              <CopyButton 
                value={paymentAddress} 
                className="rounded-l-none"
                variant="outline"
              />
            </div>
          </div>
          
          {instructions && (
            <div className="space-y-2">
              <p className="text-gray-700 text-sm">{instructions}</p>
            </div>
          )}
          
          {qrCodeUrl && (
            <div className="flex justify-center py-2">
              <img 
                src={qrCodeUrl} 
                alt="Payment QR Code" 
                className="max-w-[150px] border rounded-md shadow-sm" 
              />
            </div>
          )}
        </div>
        
        <DialogFooter className="flex-col sm:flex-row gap-2">
          {statusUrl && (
            <Button 
              variant="outline" 
              onClick={() => window.open(statusUrl, '_blank')}
              className="w-full sm:w-auto"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Check Payment Status
            </Button>
          )}
          <Button 
            onClick={() => onOpenChange(false)} 
            className="w-full sm:w-auto"
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CryptoPaymentDialog;


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
import { ExternalLink, AlertTriangle, Wallet } from 'lucide-react';
import { CryptoPaymentDetails } from '@/hooks/payments/types';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import DialogContentComponent from './CryptoPayment/DialogContent';

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
    statusUrl, 
    expiresAt,
    usdValue,
    tokenAmount,
    tokenPrice,
    amount: cryptoAmount 
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
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            <span>Crypto Payment Instructions</span>
          </DialogTitle>
        </DialogHeader>
        
        {/* Use the dedicated DialogContent component to organize and display payment details */}
        <DialogContentComponent paymentDetails={paymentDetails} />
        
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

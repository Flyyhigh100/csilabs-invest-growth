
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, AlertTriangle, Wallet } from 'lucide-react';
import { CryptoPaymentDetails } from '@/hooks/payments/types';
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
  
  const { statusUrl } = paymentDetails;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            <span>Crypto Payment Instructions</span>
          </DialogTitle>
        </DialogHeader>
        
        {/* Use the dedicated DialogContent component to organize and display payment details */}
        <DialogContentComponent paymentDetails={paymentDetails} />
        
        <DialogFooter className="flex flex-col sm:flex-row gap-2">
          {statusUrl && (
            <Button 
              variant="outline" 
              onClick={() => window.open(statusUrl, '_blank')}
              className="w-full sm:w-auto flex items-center"
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

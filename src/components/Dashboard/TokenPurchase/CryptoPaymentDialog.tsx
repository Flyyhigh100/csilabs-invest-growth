
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CryptoPaymentDetails } from '@/hooks/payments/types';
import DialogContentComponent from './CryptoPayment/DialogContent';
import DialogFooterActions from './CryptoPayment/DialogFooterActions';

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
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-lg md:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <span>Complete Your {paymentDetails?.currency || selectedCurrency} Payment</span>
            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-none ml-2">
              Amount: ${amount}
            </Badge>
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Please follow the instructions below to complete your payment
          </DialogDescription>
        </DialogHeader>
        
        <DialogContentComponent paymentDetails={paymentDetails} />
        
        <DialogFooterActions 
          onClose={() => onOpenChange(false)} 
          checkStatusUrl={paymentDetails?.checkStatusUrl}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CryptoPaymentDialog;


import React from 'react';
import { Separator } from "@/components/ui/separator";
import QRCodeSection from './QRCodeSection';
import PaymentAddressSection from './PaymentAddressSection';
import TransactionIdSection from './TransactionIdSection';
import TimeRemainingAlert from './TimeRemainingAlert';
import InstructionsSection from './InstructionsSection';
import StatusCheckSection from './StatusCheckSection';
import { CryptoPaymentDetails } from '@/hooks/payments/types';

interface DialogContentProps {
  paymentDetails: CryptoPaymentDetails;
}

const DialogContent: React.FC<DialogContentProps> = ({ paymentDetails }) => {
  if (!paymentDetails) {
    return (
      <div className="py-8 text-center text-gray-500">
        <p>Payment information is loading...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4 my-2">
      {paymentDetails.expiresAt && (
        <TimeRemainingAlert expiresAt={paymentDetails.expiresAt} />
      )}
      
      <div className="flex flex-col md:flex-row items-center gap-4 justify-center">
        {paymentDetails.qrCodeUrl && (
          <QRCodeSection qrCodeUrl={paymentDetails.qrCodeUrl} />
        )}
        
        <div className="space-y-4 flex-1">
          <PaymentAddressSection paymentAddress={paymentDetails.paymentAddress} />
          
          {paymentDetails.externalTransactionId && (
            <TransactionIdSection transactionId={paymentDetails.externalTransactionId} />
          )}
        </div>
      </div>
      
      <Separator />
      
      <InstructionsSection instructions={paymentDetails.instructions} />
      
      {paymentDetails.statusUrl && (
        <StatusCheckSection statusUrl={paymentDetails.statusUrl} />
      )}
    </div>
  );
};

export default DialogContent;

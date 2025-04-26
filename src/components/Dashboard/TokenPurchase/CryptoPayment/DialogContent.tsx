
import React from 'react';
import { Separator } from "@/components/ui/separator";
import QRCodeSection from './QRCodeSection';
import PaymentAddressSection from './PaymentAddressSection';
import TransactionIdSection from './TransactionIdSection';
import TimeRemainingAlert from '@/components/Dashboard/TokenPurchase/CryptoPayment/TimeRemainingAlert';
import InstructionsSection from './InstructionsSection';
import StatusCheckSection from './StatusCheckSection';
import { CryptoPaymentDetails } from '@/hooks/payments/types';
import { Spinner } from "@/components/ui/spinner";

interface DialogContentProps {
  paymentDetails: CryptoPaymentDetails;
}

const DialogContent: React.FC<DialogContentProps> = ({ paymentDetails }) => {
  if (!paymentDetails) {
    return (
      <div className="py-8 text-center text-gray-500 flex flex-col items-center">
        <Spinner className="mb-4" />
        <p>Payment information is loading...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4 my-2">
      {paymentDetails.expiresAt && (
        <TimeRemainingAlert expiresAt={paymentDetails.expiresAt} />
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <QRCodeSection 
          qrCodeUrl={paymentDetails.qrCodeUrl} 
          paymentAddress={paymentDetails.paymentAddress} 
        />
        
        <div className="space-y-4">
          <PaymentAddressSection paymentAddress={paymentDetails.paymentAddress} />
          
          {paymentDetails.externalTransactionId && (
            <TransactionIdSection transactionId={paymentDetails.externalTransactionId} />
          )}
        </div>
      </div>
      
      <Separator className="my-4" />
      
      <InstructionsSection 
        paymentDetails={paymentDetails} 
        instructions={paymentDetails.instructions} 
      />
      
      {paymentDetails.statusUrl && (
        <StatusCheckSection statusUrl={paymentDetails.statusUrl} />
      )}
    </div>
  );
};

export default DialogContent;

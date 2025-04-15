
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
  
  // Display both USD amount and crypto amount if available
  const currency = paymentDetails.currency || 'USDT';
  const amount = paymentDetails.amount || 0; // Use default of 0 if amount isn't available
  
  return (
    <div className="space-y-4 my-2">
      {paymentDetails.expiresAt && (
        <TimeRemainingAlert expiresAt={paymentDetails.expiresAt} />
      )}
      
      {/* Payment amount section */}
      <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">USD Amount:</span>
            <span className="font-semibold">${amount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Payment Amount:</span>
            <span className="font-semibold text-blue-700">
              {paymentDetails.cryptoAmount !== undefined 
                ? `${paymentDetails.cryptoAmount} ${currency}`
                : `${amount} ${currency}`
              }
            </span>
          </div>
        </div>
      </div>
      
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

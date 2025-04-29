
import React from 'react';
import { Separator } from "@/components/ui/separator";
import { CryptoPaymentDetails } from '@/hooks/payments/types';
import PaymentAddressSection from './PaymentAddressSection';
import QRCodeSection from './QRCodeSection';
import TransactionIdSection from './TransactionIdSection';
import TimeRemainingAlert from './TimeRemainingAlert';
import InstructionsSection from './InstructionsSection';
import StatusCheckSection from './StatusCheckSection';

interface DialogContentProps {
  paymentDetails: CryptoPaymentDetails;
}

const DialogContent: React.FC<DialogContentProps> = ({ paymentDetails }) => {
  if (!paymentDetails) return null;

  const {
    paymentAddress,
    qrCodeUrl,
    externalTransactionId,
    currency,
    amount,
    checkStatusUrl,
    expiresAt,
    instructions
  } = paymentDetails;

  return (
    <div className="space-y-4 py-2">
      {/* Time remaining countdown if relevant */}
      {expiresAt && <TimeRemainingAlert expiresAt={expiresAt} />}

      {/* Grid layout for QR code and address */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* QR Code */}
        <QRCodeSection
          qrCodeUrl={qrCodeUrl}
          paymentAddress={paymentAddress}
          currency={currency}
          amount={amount}
        />

        {/* Payment Address */}
        <div className="space-y-4">
          <PaymentAddressSection 
            paymentAddress={paymentAddress} 
            currency={currency}
          />
          
          {/* Transaction ID */}
          {externalTransactionId && (
            <TransactionIdSection transactionId={externalTransactionId} />
          )}
        </div>
      </div>

      <Separator />
      
      {/* Instructions */}
      <InstructionsSection 
        instructions={instructions || `Please send exactly ${amount} ${currency} to the address above.`}
      />
      
      {/* Status Check */}
      {checkStatusUrl && (
        <>
          <Separator />
          <StatusCheckSection checkStatusUrl={checkStatusUrl} />
        </>
      )}
    </div>
  );
};

export default DialogContent;

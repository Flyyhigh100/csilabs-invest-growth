
import React from 'react';
import { DialogHeader, DialogFooter, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import QRCodeSection from './QRCodeSection';
import PaymentAddressSection from './PaymentAddressSection';
import TransactionIdSection from './TransactionIdSection';
import StatusCheckSection from './StatusCheckSection';
import TimeRemainingAlert from './TimeRemainingAlert';
import InstructionsSection from './InstructionsSection';
import DialogFooterActions from './DialogFooterActions';
import { CryptoPaymentDetails } from '@/hooks/payments/types';

interface DialogContentProps {
  paymentDetails: CryptoPaymentDetails | null;
  onOpenChange: (open: boolean) => void;
  amount: number;
  selectedCurrency: string;
}

const DialogContent: React.FC<DialogContentProps> = ({
  paymentDetails,
  onOpenChange,
  amount,
  selectedCurrency
}) => {
  if (!paymentDetails) {
    return null;
  }

  // Extract payment details, handling both legacy and new property names
  const address = paymentDetails.address || paymentDetails.payment_address || paymentDetails.paymentAddress || '';

  // Determine currency to display (from paymentDetails or fallback to selected)
  const currency = paymentDetails.currency || selectedCurrency || 'USDT';
  
  // Extract transaction ID (handling multiple possible property names)
  const transactionId = 
    paymentDetails.transactionId || 
    paymentDetails.payment_id || 
    paymentDetails.externalTransactionId || 
    paymentDetails.txn_id || 
    paymentDetails.txnId || 
    '';
  
  // Get QR code URL
  const qrCodeUrl = paymentDetails.qrCodeUrl || paymentDetails.qrcode_url || '';
  
  // Get status check URL
  const statusCheckUrl = 
    paymentDetails.statusUrl || 
    paymentDetails.status_url || 
    paymentDetails.checkStatusUrl || 
    '';
    
  // Check if address and amount are available for payment
  const hasPaymentAddress = Boolean(
    paymentDetails.paymentAddress || 
    paymentDetails.payment_address || 
    paymentDetails.address
  );
  
  // Get expiration info if available
  const expiresAt = paymentDetails.expiresAt;
  const hasExpiration = Boolean(expiresAt);
  
  // Get custom instructions if available
  const instructions = paymentDetails.instructions;

  return (
    <>
      <DialogHeader>
        <DialogTitle className="text-lg">Complete Your Crypto Payment</DialogTitle>
        <DialogDescription>
          Please send {paymentDetails.amount} {currency} to complete your purchase of CSi tokens.
        </DialogDescription>
      </DialogHeader>
      
      {/* Payment QR Code */}
      <QRCodeSection qrCodeUrl={qrCodeUrl} address={address} currency={currency} />
      
      {/* Payment Address */}
      <PaymentAddressSection address={address} currency={currency} />
      
      {/* Transaction ID */}
      <TransactionIdSection transactionId={transactionId} />
      
      {/* Time Remaining Alert */}
      {hasExpiration && <TimeRemainingAlert expiresAt={expiresAt} />}
      
      {/* Payment Instructions */}
      <InstructionsSection paymentDetails={paymentDetails} instructions={instructions} />
      
      {/* Status Check Button */}
      <StatusCheckSection 
        statusCheckUrl={statusCheckUrl} 
        transactionId={transactionId} 
      />

      {/* Dialog Footer */}
      <DialogFooter className="mt-4">
        <DialogFooterActions 
          onClose={() => onOpenChange(false)}
          statusCheckUrl={statusCheckUrl}
        />
      </DialogFooter>
    </>
  );
};

export default DialogContent;

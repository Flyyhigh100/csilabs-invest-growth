
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from 'lucide-react';

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
  
  // Check if we're missing critical payment information
  // Use both legacy (payment_address) and new property names (address)
  const hasCriticalError = !paymentDetails.address && 
    !paymentDetails.payment_address && 
    !paymentDetails.paymentAddress;
  
  if (hasCriticalError) {
    return (
      <div className="py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Unable to generate payment information. Please try again or contact support.
          </AlertDescription>
        </Alert>
        
        <div className="mt-4 bg-gray-50 p-4 rounded-md text-sm">
          <h4 className="font-medium mb-2">Debug Information:</h4>
          <p className="text-xs text-gray-600 mb-2">
            This information may help support diagnose the issue:
          </p>
          <pre className="text-xs bg-gray-100 p-3 rounded overflow-auto max-h-40">
            {JSON.stringify({
              hasTransactionId: !!(paymentDetails.transactionId || paymentDetails.payment_id),
              hasExternalId: !!(paymentDetails.externalTransactionId || paymentDetails.txn_id || paymentDetails.txnId),
              hasQrCode: !!(paymentDetails.qrCodeUrl || paymentDetails.qrcode_url),
              currency: paymentDetails.currency,
              timeStamp: new Date().toISOString()
            }, null, 2)}
          </pre>
        </div>
      </div>
    );
  }

  // Ensure we use either the new property names or fall back to legacy names
  const paymentAddress = paymentDetails.address || 
    paymentDetails.paymentAddress || 
    paymentDetails.payment_address;
  
  const qrCodeUrl = paymentDetails.qrCodeUrl || paymentDetails.qrcode_url;
  const statusUrl = paymentDetails.statusUrl || paymentDetails.status_url;
  const externalTxnId = paymentDetails.txnId || 
    paymentDetails.externalTransactionId || 
    paymentDetails.txn_id;
  
  return (
    <div className="space-y-4 my-2">
      {paymentDetails.expiresAt && (
        <TimeRemainingAlert expiresAt={paymentDetails.expiresAt} />
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <QRCodeSection 
          qrCodeUrl={qrCodeUrl} 
          paymentAddress={paymentAddress}
          currency={paymentDetails.currency}
          amount={paymentDetails.amount} 
        />
        
        <div className="space-y-4">
          <PaymentAddressSection 
            paymentAddress={paymentAddress} 
            currency={paymentDetails.currency}
          />
          
          {externalTxnId && (
            <TransactionIdSection transactionId={externalTxnId} />
          )}
        </div>
      </div>
      
      <Separator className="my-4" />
      
      <InstructionsSection 
        paymentDetails={paymentDetails} 
        instructions={paymentDetails.instructions} 
      />
      
      {statusUrl && (
        <StatusCheckSection statusUrl={statusUrl} />
      )}
      
      <Alert variant="default" className="bg-blue-50 border-blue-200 text-blue-800">
        <AlertDescription>
          <strong>Payment Testing Info:</strong> You can visit the Transactions page to check payment status or use the link above to track your payment on CoinPayments.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default DialogContent;

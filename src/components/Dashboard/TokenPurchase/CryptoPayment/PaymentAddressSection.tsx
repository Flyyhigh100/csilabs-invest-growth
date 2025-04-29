
import React from 'react';
import { Button } from "@/components/ui/button";
import { Copy, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from 'sonner';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { validateAddress, getNetworkName } from '@/hooks/payments/crypto/validationUtils';

interface PaymentAddressSectionProps {
  paymentAddress: string;
  currency?: string;
}

const PaymentAddressSection: React.FC<PaymentAddressSectionProps> = ({ 
  paymentAddress,
  currency = 'USDT'
}) => {
  const [copied, setCopied] = React.useState(false);

  // Validate the payment address for the specific currency
  const validationResult = React.useMemo(() => {
    if (!paymentAddress) return { isValid: false, message: 'No payment address provided' };
    return validateAddress(paymentAddress, currency);
  }, [paymentAddress, currency]);

  // Get appropriate network label based on currency
  const networkLabel = React.useMemo(() => {
    return getNetworkName(currency);
  }, [currency]);

  const handleCopy = () => {
    if (paymentAddress && validationResult.isValid) {
      navigator.clipboard.writeText(paymentAddress);
      setCopied(true);
      toast.success("Payment address copied to clipboard");
      
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  };

  if (!validationResult.isValid) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {validationResult.message || "Invalid payment address format. Please contact support or try another currency."}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <h3 className="text-sm font-medium mb-2">Payment Address ({networkLabel})</h3>
      <div className="flex items-center gap-2">
        <div className="bg-white p-3 rounded border border-gray-200 text-sm font-mono break-all w-full">
          {paymentAddress}
        </div>
        <Button 
          variant="outline" 
          size="icon"
          className="flex-shrink-0"
          onClick={handleCopy}
          aria-label={copied ? "Copied" : "Copy address"}
        >
          {copied ? 
            <CheckCircle className="h-4 w-4 text-green-500" /> : 
            <Copy className="h-4 w-4" />
          }
        </Button>
      </div>
    </div>
  );
};

export default PaymentAddressSection;

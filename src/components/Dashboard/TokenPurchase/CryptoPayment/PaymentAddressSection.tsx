
import React from 'react';
import { Button } from "@/components/ui/button";
import { Copy, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from 'sonner';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PaymentAddressSectionProps {
  paymentAddress: string;
}

const PaymentAddressSection: React.FC<PaymentAddressSectionProps> = ({ paymentAddress }) => {
  const [copied, setCopied] = React.useState(false);

  // Validate the payment address
  const isValidAddress = React.useMemo(() => {
    if (!paymentAddress) return false;
    return /^0x[a-fA-F0-9]{40}$/.test(paymentAddress);
  }, [paymentAddress]);

  const handleCopy = () => {
    if (paymentAddress && isValidAddress) {
      navigator.clipboard.writeText(paymentAddress);
      setCopied(true);
      toast.success("Payment address copied to clipboard");
      
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  };

  if (!isValidAddress) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Invalid payment address format. Please contact support.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <h3 className="text-sm font-medium mb-2">Payment Address (BEP-20)</h3>
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

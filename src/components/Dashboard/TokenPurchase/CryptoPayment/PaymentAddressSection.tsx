
import React from 'react';
import { Button } from "@/components/ui/button";
import { CopyIcon, CheckCircle } from "lucide-react";
import { toast } from 'sonner';

interface PaymentAddressSectionProps {
  paymentAddress: string;
}

const PaymentAddressSection: React.FC<PaymentAddressSectionProps> = ({ paymentAddress }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    if (paymentAddress) {
      navigator.clipboard.writeText(paymentAddress);
      setCopied(true);
      toast.success("Payment address copied to clipboard");
      
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <h3 className="text-sm font-medium mb-2">Payment Address</h3>
      <div className="flex items-center gap-2">
        <div className="bg-white p-2 rounded border border-gray-200 text-sm font-mono overflow-auto max-w-full break-all w-full">
          {paymentAddress}
        </div>
        <Button 
          variant="outline" 
          size="icon"
          className="flex-shrink-0"
          onClick={handleCopy}
        >
          {copied ? 
            <CheckCircle className="h-4 w-4 text-green-500" /> : 
            <CopyIcon className="h-4 w-4" />
          }
        </Button>
      </div>
    </div>
  );
};

export default PaymentAddressSection;

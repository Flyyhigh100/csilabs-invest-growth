
import React from 'react';
import { Button } from "@/components/ui/button";
import { Copy, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from 'sonner';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface PaymentAddressSectionProps {
  address?: string;  // Added this prop to match DialogContent
  paymentAddress?: string;  // Keep this for backward compatibility
  currency?: string;
}

const PaymentAddressSection: React.FC<PaymentAddressSectionProps> = ({ 
  address,
  paymentAddress,
  currency = "BNB" 
}) => {
  // Use either address or paymentAddress, whichever is provided
  const actualAddress = address || paymentAddress || '';
  const [copied, setCopied] = React.useState(false);
  
  // Get the appropriate network label based on currency
  const getNetworkLabel = React.useCallback(() => {
    // Map currencies to their network labels
    const networkLabels: Record<string, string> = {
      "BNB": "BEP-20",
      "BSC": "BEP-20",
      "ETH": "ERC-20",
      "USDT": "TRC-20",
      "TRX": "TRX Network",
      "USDC": "ERC-20",
      "MATIC": "Polygon",
      "BTC": "Bitcoin",
      "LTC": "Litecoin",
      "DOGE": "Dogecoin",
      "XRP": "Ripple",
      "ADA": "Cardano"
    };
    
    return networkLabels[currency] || `${currency} Network`;
  }, [currency]);

  // Validate the payment address
  const isValidAddress = React.useMemo(() => {
    if (!actualAddress || actualAddress.trim() === '') return false;
    
    // Different validation patterns based on currency type
    if (currency === "BNB" || currency === "ETH" || currency === "BSC") {
      // Ethereum-style addresses (0x...)
      return /^0x[a-fA-F0-9]{40}$/.test(actualAddress);
    } else if (currency === "TRX" || currency === "USDT") {
      // Tron addresses (T...)
      return /^T[a-zA-Z0-9]{33}$/.test(actualAddress);
    } else if (currency === "BTC") {
      // Bitcoin addresses
      return /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[ac-hj-np-z02-9]{39,59}$/.test(actualAddress);
    } else if (currency === "XRP") {
      // Ripple addresses
      return /^r[0-9a-zA-Z]{24,34}$/.test(actualAddress);
    }
    
    // For any other currency, just check if it's not empty and has reasonable length
    return actualAddress.length > 10;
  }, [actualAddress, currency]);

  const handleCopy = () => {
    if (actualAddress) {
      navigator.clipboard.writeText(actualAddress);
      setCopied(true);
      toast.success("Payment address copied to clipboard");
      
      setTimeout(() => {
        setCopied(false);
      }, 2000);
    }
  };

  if (!actualAddress) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No payment address provided. Please contact support.
        </AlertDescription>
      </Alert>
    );
  }

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
      <h3 className="text-sm font-medium mb-2">Payment Address ({getNetworkLabel()})</h3>
      <div className="flex items-center gap-2">
        <div className="bg-white p-3 rounded border border-gray-200 text-sm font-mono break-all w-full">
          {actualAddress}
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

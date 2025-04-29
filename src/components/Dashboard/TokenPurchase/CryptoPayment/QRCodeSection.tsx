
import React, { useMemo, useState, useEffect } from 'react';
import { QrCode, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import QRCodeDisplay from './QRCodeDisplay';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';

interface QRCodeSectionProps {
  qrCodeUrl?: string;
  paymentAddress: string;
  currency?: string;
  amount?: string;
}

const QRCodeSection: React.FC<QRCodeSectionProps> = ({ 
  qrCodeUrl, 
  paymentAddress,
  currency = 'USDT',
  amount
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [generatedQrUrl, setGeneratedQrUrl] = useState<string | null>(null);
  
  // Determine which address format is being used
  const addressFormat = useMemo(() => {
    if (!paymentAddress) return 'invalid';
    
    // Check for valid BEP-20/ERC-20 address format (ETH-like)
    if (/^0x[a-fA-F0-9]{40}$/.test(paymentAddress)) {
      return 'eth';
    }
    
    // Check for valid Bitcoin address format (starting with 1, 3, or bc1)
    if (/^(1|3|bc1)[a-zA-Z0-9]{25,42}$/.test(paymentAddress)) {
      return 'btc';
    }
    
    // Add more checks for other cryptocurrency address formats as needed
    
    // Return generic if no specific format identified but not invalid
    return paymentAddress.length > 10 ? 'generic' : 'invalid';
  }, [paymentAddress]);
  
  // Determine which QR code URL to use
  const displayQrCodeUrl = useMemo(() => {
    if (addressFormat === 'invalid') {
      console.error("Invalid payment address format:", paymentAddress);
      return null;
    }
    
    // If we have a predetermined QR code URL, use it
    if (qrCodeUrl) {
      console.log("Using provided QR code URL");
      return qrCodeUrl;
    }
    
    // If we've generated one, use it
    if (generatedQrUrl) {
      return generatedQrUrl;
    }
    
    // Generate QR code with payment data
    try {
      console.log(`Generating QR code for ${addressFormat} address: ${paymentAddress}`);
      
      // Format data based on address type
      let qrData: any;
      
      if (addressFormat === 'eth') {
        qrData = {
          address: paymentAddress,
          network: currency.includes('BNB') || currency.includes('BSC') ? 'BSC' : 'ETH', 
          type: 'address',
          amount: amount || undefined
        };
      } else if (addressFormat === 'btc') {
        // Bitcoin URI format
        let uri = `bitcoin:${paymentAddress}`;
        if (amount) uri += `?amount=${amount}`;
        qrData = uri;
      } else {
        // Generic format
        qrData = {
          address: paymentAddress,
          currency: currency,
          amount: amount || undefined
        };
      }
      
      // Use Google Chart API for QR generation as a reliable fallback
      const qrDataString = typeof qrData === 'string' ? qrData : JSON.stringify(qrData);
      return `https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=${encodeURIComponent(qrDataString)}&choe=UTF-8`;
    } catch (error) {
      console.error("Error generating QR code:", error);
      return null;
    }
  }, [qrCodeUrl, paymentAddress, addressFormat, currency, amount, generatedQrUrl]);

  // Handle successful loading
  const handleImageLoad = () => {
    console.log("QR code image loaded successfully");
    setIsLoading(false);
    setLoadError(false);
  };

  // Handle loading error
  const handleImageError = () => {
    console.error('Error loading QR code image');
    setLoadError(true);
    setIsLoading(false);
    
    // Attempt to generate a QR code with a different service if the provided one fails
    if (qrCodeUrl && !generatedQrUrl) {
      try {
        // Create a simple fallback QR code with just the address
        const fallbackUrl = `https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=${encodeURIComponent(paymentAddress)}&choe=UTF-8`;
        console.log("Attempting fallback QR generation with Google Charts API");
        setGeneratedQrUrl(fallbackUrl);
        // Reset the loading state for the new QR code attempt
        setIsLoading(true);
        setLoadError(false);
      } catch (fallbackError) {
        console.error("Fallback QR generation also failed:", fallbackError);
      }
    }
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(paymentAddress)
      .then(() => toast.success("Payment address copied to clipboard"))
      .catch(() => toast.error("Failed to copy address"));
  };

  if (addressFormat === 'invalid') {
    return (
      <Alert variant="destructive" className="mb-2">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Invalid payment address format. Please contact support.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 text-center flex flex-col items-center">
      <h3 className="text-sm font-medium mb-2 flex items-center justify-center gap-1">
        <QrCode className="h-4 w-4" />
        Scan QR Code
      </h3>
      
      <QRCodeDisplay
        qrCodeUrl={displayQrCodeUrl || ''}
        onLoad={handleImageLoad}
        onError={handleImageError}
        isLoading={isLoading}
        fallbackContent={
          <div className="py-4">
            <p className="text-sm font-medium mb-2">Use this payment address:</p>
            <div className="bg-gray-50 p-2 rounded font-mono text-xs break-all mb-2">
              {paymentAddress}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={handleCopyAddress}
            >
              Copy Address
            </Button>
          </div>
        }
      />
      
      <p className="text-xs text-gray-500 mt-2">
        Scan to make payment
      </p>
      <p className="text-xs text-gray-500">
        {amount ? `Send ${amount} ${currency}` : `Enter amount manually in your wallet app if needed`}
      </p>
    </div>
  );
};

export default QRCodeSection;

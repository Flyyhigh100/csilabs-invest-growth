
import React, { useMemo, useState, useEffect } from 'react';
import { QrCode, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import QRCodeDisplay from './QRCodeDisplay';
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { detectAddressFormat, createQrCodeUriData } from '@/hooks/payments/crypto/validationUtils';

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
    if (!paymentAddress) return { isValid: false, message: 'No payment address provided' };
    return detectAddressFormat(paymentAddress);
  }, [paymentAddress]);
  
  // Determine which QR code URL to use
  const displayQrCodeUrl = useMemo(() => {
    if (!addressFormat.isValid) {
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
      console.log(`Generating QR code for ${addressFormat.format?.name} address: ${paymentAddress}`);
      
      // Generate URI data based on detected format
      const qrData = createQrCodeUriData(paymentAddress, amount, currency);
      
      // Use Google Chart API for QR generation as a reliable fallback
      return `https://chart.googleapis.com/chart?chs=300x300&cht=qr&chl=${encodeURIComponent(qrData)}&choe=UTF-8`;
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

  if (!addressFormat.isValid) {
    return (
      <Alert variant="destructive" className="mb-2">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {addressFormat.message || "Invalid payment address format. Please contact support."}
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

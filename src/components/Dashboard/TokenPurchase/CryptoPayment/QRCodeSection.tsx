
import React, { useMemo } from 'react';
import { QrCode } from 'lucide-react';

interface QRCodeSectionProps {
  qrCodeUrl?: string;
  paymentAddress: string;
}

const QRCodeSection: React.FC<QRCodeSectionProps> = ({ qrCodeUrl, paymentAddress }) => {
  // Generate a new QR code URL with just the clean payment address
  // This will ensure wallets only receive the address without prefixes or parameters
  const cleanQrCodeUrl = useMemo(() => {
    // If we have a clean payment address, create a QR code for it directly
    if (paymentAddress) {
      // Use a data URI to generate QR code for just the payment address
      // This will be a fallback in case we can't use the QR code API
      return `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(paymentAddress)}&size=200x200`;
    }
    // Fall back to the provided QR code URL if no clean address is available
    return qrCodeUrl;
  }, [paymentAddress, qrCodeUrl]);

  return (
    <div className="bg-white rounded-lg p-3 border-2 border-gray-200 text-center">
      <h3 className="text-sm font-medium mb-2 flex items-center justify-center gap-1">
        <QrCode className="h-4 w-4" />
        Scan QR Code
      </h3>
      <img 
        src={cleanQrCodeUrl} 
        alt="Payment QR Code" 
        className="w-40 h-40 object-contain mx-auto"
      />
      <p className="text-xs text-gray-500 mt-2">
        QR code contains only the wallet address
      </p>
      <p className="text-xs text-gray-500">
        Enter amount manually in your wallet app
      </p>
    </div>
  );
};

export default QRCodeSection;


import React from 'react';
import { QrCode } from 'lucide-react';

interface QRCodeSectionProps {
  qrCodeUrl: string;
}

const QRCodeSection: React.FC<QRCodeSectionProps> = ({ qrCodeUrl }) => {
  return (
    <div className="bg-white rounded-lg p-3 border-2 border-gray-200 text-center">
      <h3 className="text-sm font-medium mb-2 flex items-center justify-center gap-1">
        <QrCode className="h-4 w-4" />
        Scan QR Code
      </h3>
      <img 
        src={qrCodeUrl} 
        alt="Payment QR Code" 
        className="w-40 h-40 object-contain mx-auto"
      />
      <p className="text-xs text-gray-500 mt-2">Scan with your crypto wallet app</p>
    </div>
  );
};

export default QRCodeSection;

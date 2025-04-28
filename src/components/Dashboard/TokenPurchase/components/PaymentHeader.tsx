
import React from 'react';
import { Wallet } from 'lucide-react';

const PaymentHeader: React.FC = () => {
  return (
    <div className="flex items-start gap-3 mb-4">
      <div className="bg-white p-2 rounded-full border border-gray-200">
        <Wallet className="h-6 w-6 text-cbis-blue" />
      </div>
      <div>
        <h4 className="font-medium text-gray-800">Cryptocurrency Payment</h4>
        <p className="text-sm text-gray-600 mt-1">
          Pay with your preferred cryptocurrency. KYC required for amounts $10,000 or more.
        </p>
      </div>
    </div>
  );
};

export default PaymentHeader;

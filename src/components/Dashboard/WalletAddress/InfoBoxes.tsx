
import React from 'react';
import { Wallet, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export const WalletInfoBox: React.FC = () => {
  return (
    <div className="mb-6 bg-blue-50/70 p-4 rounded-lg border border-blue-100">
      <div className="flex gap-3">
        <div className="mt-0.5">
          <Wallet className="h-5 w-5 text-blue-500" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-1">Wallet Address Required</h3>
          <p className="text-sm text-gray-600">
            Your wallet address is required to receive CSi tokens after purchase. This is like your bank account number for cryptocurrency.
          </p>
        </div>
      </div>
    </div>
  );
};

export const WalletWarningBox: React.FC = () => {
  return (
    <div className="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-200">
      <div className="text-sm text-gray-600 space-y-3">
        <div className="flex items-start gap-2">
          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
          <p>Make sure to enter your own wallet address that supports the Polygon network.</p>
        </div>
        <div className="flex items-start gap-2">
          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
          <p className="font-bold uppercase">
            DOUBLE-CHECK YOUR ADDRESS BEFORE SAVING. TRANSACTIONS SENT TO INCORRECT ADDRESSES CANNOT BE RECOVERED.{" "}
            <Link to="/legal/terms-and-conditions#wallet-control" className="text-blue-600 hover:underline">
              [DISCLAIMER]
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

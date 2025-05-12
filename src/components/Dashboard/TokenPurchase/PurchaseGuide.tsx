import React from 'react';
const PurchaseGuide: React.FC = () => {
  return <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4">
      <h3 className="text-sm font-medium text-gray-700 mb-2">How purchasing works</h3>
      <ol className="text-sm text-gray-600 list-decimal pl-5 space-y-1.5">
        <li>Enter the amount you want to contribute</li>
        <li>Choose your preferred cryptocurrency for payment</li>
        <li>Complete the payment process</li>
        <li>CSi tokens will be sent to your wallet address</li>
      </ol>
    </div>;
};
export default PurchaseGuide;
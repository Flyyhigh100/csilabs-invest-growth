
import React from 'react';

const EmptyWalletState: React.FC = () => {
  return (
    <div className="text-center p-6 border rounded-md bg-gray-50">
      <h3 className="text-lg font-medium mb-2">Direct payments unavailable</h3>
      <p className="text-muted-foreground mb-4">
        No company wallet addresses are currently configured. Please try another payment method.
      </p>
      <div className="text-sm text-gray-500">
        Contact support if you believe this is an error.
      </div>
    </div>
  );
};

export default EmptyWalletState;

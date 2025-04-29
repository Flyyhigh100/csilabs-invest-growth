
import React from 'react';

interface TransactionIdSectionProps {
  transactionId: string;
}

const TransactionIdSection: React.FC<TransactionIdSectionProps> = ({ transactionId }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <h3 className="text-sm font-medium mb-2">Transaction ID</h3>
      <p className="text-sm font-mono break-all bg-white p-2 rounded border border-gray-200">
        {transactionId}
      </p>
    </div>
  );
};

export default TransactionIdSection;

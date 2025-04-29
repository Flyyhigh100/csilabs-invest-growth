
import React from 'react';
import { CopyButton } from "@/components/ui/copy-button";

interface TransactionIdSectionProps {
  transactionId: string;
}

const TransactionIdSection: React.FC<TransactionIdSectionProps> = ({ transactionId }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <h3 className="text-sm font-medium mb-2">Transaction ID</h3>
      <div className="flex items-center gap-2">
        <code className="bg-white p-3 rounded border border-gray-200 text-xs font-mono break-all w-full">
          {transactionId}
        </code>
        <CopyButton value={transactionId} variant="outline" size="icon" />
      </div>
      <p className="text-xs text-gray-500 mt-2">
        Keep this ID for reference if you need support
      </p>
    </div>
  );
};

export default TransactionIdSection;

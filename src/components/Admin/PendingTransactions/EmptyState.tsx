
import React from 'react';
import { CheckCircle } from 'lucide-react';

const EmptyState = () => {
  return (
    <div className="text-center py-8 bg-gray-50 rounded-lg">
      <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
      <h3 className="mt-2 text-lg font-medium">No pending transactions</h3>
      <p className="mt-1 text-gray-500">
        All token distributions have been completed
      </p>
    </div>
  );
};

export default EmptyState;

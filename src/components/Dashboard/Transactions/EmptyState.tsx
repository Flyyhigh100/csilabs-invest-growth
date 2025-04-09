
import React from 'react';
import { InfoIcon } from 'lucide-react';

const EmptyState = () => (
  <div className="text-center py-12 bg-gray-50 rounded-lg">
    <InfoIcon className="mx-auto h-12 w-12 text-gray-400" />
    <h3 className="mt-2 text-lg font-medium text-gray-900">No transactions yet</h3>
    <p className="mt-1 text-gray-500">
      When you make a purchase, your transaction history will appear here.
    </p>
  </div>
);

export default EmptyState;


import React from 'react';
import { AlertCircle } from 'lucide-react';

const IPNLogEmptyState: React.FC = () => {
  return (
    <div className="text-center py-8 border rounded-md bg-gray-50">
      <AlertCircle className="h-10 w-10 mx-auto mb-2 text-gray-400" />
      <p className="text-sm text-gray-600">No IPN logs found</p>
      <p className="text-xs text-gray-500 mt-1">Webhook notifications will appear here when received</p>
    </div>
  );
};

export default IPNLogEmptyState;

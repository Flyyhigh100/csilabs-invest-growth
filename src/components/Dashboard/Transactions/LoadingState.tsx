
import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingState = () => (
  <div className="flex justify-center items-center py-12">
    <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
    <span className="ml-2 text-gray-500">Loading transaction history...</span>
  </div>
);

export default LoadingState;

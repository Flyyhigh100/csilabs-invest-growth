
import React from 'react';
import { RefreshCw } from 'lucide-react';

const LoadingState: React.FC = () => {
  return (
    <div className="flex items-center justify-center p-6">
      <RefreshCw className="w-5 h-5 animate-spin mr-2" />
      <span>Loading payment options...</span>
    </div>
  );
};

export default LoadingState;
